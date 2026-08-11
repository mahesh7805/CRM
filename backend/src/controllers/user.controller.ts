import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: { select: { id: true, name: true, description: true } },
        createdAt: true,
      },
    });

    return res.json({ success: true, users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    return res.json({ success: true, roles });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ success: false, message: 'Name, Email, Password, and Role are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const role = await prisma.role.findUnique({ where: { name: roleName as string } });
    if (!role) {
      return res.status(400).json({ success: false, message: `Invalid role specified: ${roleName}` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        roleId: role.id,
        status: 'ACTIVE',
        createdById: req.user!.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'USER_CREATED',
        entity: 'User',
        entityId: user.id,
        details: `Created new user ${user.name} (${user.email}) with role ${role.name}`,
        userId: req.user!.userId,
      },
    });

    return res.status(201).json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating self
    if (user.id === req.user!.userId) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const updated = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: { select: { name: true } },
      },
    });

    return res.json({
      success: true,
      message: `User status changed to ${newStatus}`,
      user: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
