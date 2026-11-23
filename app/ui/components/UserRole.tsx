'use client'

import React from 'react'

interface UserRolesProps {
  roles: { id?: number; role_description: string }[]
}

const UserRoles: React.FC<UserRolesProps> = ({ roles }) => {
  return (
    <div className={`text-center `}>
      {roles && roles.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2">
          {roles.map((role, index) => (
            <span
              key={role.id || index}
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-lg shadow-sm"
            >
              {role.role_description}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-400">نقشی ثبت نشده است</span>
      )}
    </div>
  )
}

export default UserRoles;
