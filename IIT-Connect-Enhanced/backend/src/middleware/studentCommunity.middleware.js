import { ApiError } from '../utils/apiError.js'
export function requireStudentCommunity(req,res,next){if(req.user?.role!=='student'&&req.user?.role!=='admin')return next(new ApiError(403,'This endpoint belongs to the student community'));next()}
