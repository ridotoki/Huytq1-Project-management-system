import db from '../config/db.js';
import Admin from '../models/admin-model.js';
import Employee from '../models/employee-model.js';
import Department from '../models/department-model.js';
import DepartmentEmployee from '../models/department-employee-model.js';
import Project from '../models/project-model.js';
import DepartmentProject from '../models/department-project-model.js';
import moment from 'moment';

const addDepartment = async (req, res) => {
    const t = await db.transaction();
    try {
        const currentAdmin = req.admin.id;

        if (currentAdmin === null) {
            return res.status(404).json({
                message: "Admin not found, contact tech staff for instruction"
            });
        }

        const findCurrentAdmin = await Admin.findOne({
            where: {
                id: currentAdmin
            }
        });

        if (!findCurrentAdmin) {
            return res.status(403).json({
                message: "You are not admin"
            });
        }

        const { name, description, foundingDate, adminId, employees, projects } = req.body;

        const createBy = findCurrentAdmin.id;

        if (!name || !foundingDate || !adminId) {
            return res.status(301).json({
                message: "Missing required information"
            });
        }

        if (!moment(foundingDate).isValid()) {
            return res.status(301).json({
                message: "Invalid date format"
            });
        }

        const findAdmin = await Admin.findOne({
            where: {
                id: adminId
            }
        });

        if (!findAdmin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        const newDepartment = await Department.create({
            name,
            description,
            foundingDate,
            adminId,
            createBy
        }, { transaction: t });

        const findEmployees = await Employee.findAll({
            where: {
                id: employees,
                isAdmin: 0
            }
        });

        let departmentEmployees = [];
        findEmployees.forEach(employee => {
            departmentEmployees.push({
                departmentId: newDepartment.id,
                employeeId: employee.id
            })
        });

        await DepartmentEmployee.bulkCreate(departmentEmployees, { transaction: t });

        const findProjects = await Project.findAll({
            where: {
                id: projects
            }
        });

        let departmentProjects = [];
        findProjects.forEach(project => {
            departmentProjects.push({
                departmentId: newDepartment.id,
                projectId: project.id
            })
        });

        await DepartmentProject.bulkCreate(departmentProjects, { transaction: t });

        await t.commit();

        return res.status(201).json({
            message: "Department created",
            data: newDepartment
        });

    } catch (error) {
        console.error(error.message);
        await t.rollback();
        res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

const getDepartments = async (req, res) => {
    try {
        const currentAdmin = req.admin.id;

        if (currentAdmin === null) {
            return res.status(404).json({
                message: "Admin not found, contact tech staff for instruction"
            });
        }

        const findCurrentAdmin = await Admin.findOne({
            where: {
                id: currentAdmin
            }
        });

        if (!findCurrentAdmin) {
            return res.status(403).json({
                message: "You are not admin"
            });
        }

        const size = req.query.limit;
        const page = req.query.offset;

        const limit = parseInt(size) ? +parseInt(size) : 3;
        const offset = parseInt(page) ? parseInt(page) * parseInt(size) : 0;

        const findDepartments = await Department.findAll({
            include: [
                {
                    model: Admin,
                    attributes: ['id', 'name', 'status']
                },
                {
                    model: Employee,
                    attributes: ['id', 'name', 'idNumber'],
                    through: { attributes: [] }
                },
                {
                    model: Project,
                    attributes: ['id', 'name', 'projectStatus', 'startDate'],
                    through: { attributes: [] }
                }
            ],
            limit: limit,
            offset: offset
        });

        return res.status(200).json({
            message: "Departments found",
            data: findDepartments
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

const getDepartment = async (req, res) => {
    try {
        const currentAdmin = req.admin.id;

        if (currentAdmin === null) {
            return res.status(404).json({
                message: "Admin not found, contact tech staff for instruction"
            });
        }

        const findCurrentAdmin = await Admin.findOne({
            where: {
                id: currentAdmin
            }
        });

        if (!findCurrentAdmin) {
            return res.status(403).json({
                message: "You are not admin"
            });
        }

        const id = req.params.id;

        const findDepartment = await Department.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Admin,
                    attributes: ['name', 'status']
                },
                {
                    model: Employee,
                    through: { attributes: [] }
                }
            ],
        });

        if (!findDepartment) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        return res.status(200).json({
            message: "Deparment found",
            data: findDepartment
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

const updateDepartment = async (req, res) => {
    const t = await db.transaction();
    try {
        const currentAdmin = req.admin.id;

        if (currentAdmin === null) {
            return res.status(404).json({
                message: "Admin not found, contact tech staff for instruction"
            });
        }

        const findCurrentAdmin = await Admin.findOne({
            where: {
                id: currentAdmin
            }
        });

        if (!findCurrentAdmin) {
            return res.status(403).json({
                message: "You are not admin"
            });
        }

        const { name, description, foundingDate, adminId, employees, projects } = req.body;

        const updateBy = findCurrentAdmin.id;

        if (!name || !foundingDate || !adminId) {
            return res.status(301).json({
                message: "Missing required information"
            });
        }

        if (!moment(foundingDate).isValid()) {
            return res.status(301).json({
                message: "Invalid date format"
            });
        }

        const findAdmin = await Admin.findOne({
            where: {
                id: adminId
            }
        });

        if (!findAdmin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        const id = req.params.id;

        const findDepartment = await Department.findOne({
            where: {
                id: id
            },
        });

        if (!findDepartment) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        const updateDepartment = await Department.update({
            name,
            description,
            foundingDate,
            adminId,
            updateBy,
            updateAt: Date.now()
        }, {
            where: {
                id: id
            }
        }, { transaction: t });

        await DepartmentEmployee.destroy({
            where: {
                departmentId: findDepartment.id
            }
        }, { transaction: t });

        await DepartmentProject.destroy({
            where: {
                departmentId: findDepartment.id
            }
        }, { transaction: t });

        const findEmployees = await Employee.findAll({
            where: {
                id: employees,
                isAdmin: 0
            }
        });

        let departmentEmployees = [];
        findEmployees.forEach(employee => {
            departmentEmployees.push({
                departmentId: findDepartment.id,
                employeeId: employee.id
            })
        });

        await DepartmentEmployee.bulkCreate(departmentEmployees, { transaction: t });

        const findProjects = await Project.findAll({
            where: {
                id: projects
            }
        });

        let departmentProjects = [];
        findProjects.forEach(project => {
            departmentProjects.push({
                departmentId: findDepartment.id,
                projectId: project.id
            })
        });

        await DepartmentProject.bulkCreate(departmentProjects, { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: "Department updated",
            data: updateDepartment
        });

    } catch (error) {
        console.error(error.message);
        await t.rollback();
        res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

const deleteDepartment = async (req, res) => {
    const t = await db.transaction();
    try {
        const currentAdmin = req.admin.id;

        if (currentAdmin === null) {
            return res.status(404).json({
                message: "Admin not found, contact tech staff for instruction"
            });
        }

        const findCurrentAdmin = await Admin.findOne({
            where: {
                id: currentAdmin
            }
        });

        if (!findCurrentAdmin) {
            return res.status(403).json({
                message: "You are not admin"
            });
        }

        const id = req.params.id;

        const findDepartment = await Department.findOne({
            where: {
                id: id
            },
        });

        if (!findDepartment) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        const deleteDepartment = await Department.update({
            isDeleted: 1
        }, { where: { id: id } }, { transaction: t });

        await DepartmentEmployee.destroy({
            where: {
                departmentId: id
            }
        }, { transaction: t });

        await DepartmentProject.destroy({
            where: {
                departmentId: id
            }
        }, { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: "Department deleted",
            data: deleteDepartment
        });

    } catch (error) {
        console.error(error.message);
        await t.rollback();
        res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

export default {
    addDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment
}