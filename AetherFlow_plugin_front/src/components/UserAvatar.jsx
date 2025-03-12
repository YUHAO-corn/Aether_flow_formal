import React, { useMemo } from 'react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  onClick,
  className = ''
}) => {
  // 根据用户名生成随机颜色
  const backgroundColor = useMemo(() => {
    if (!user?.username) return 'bg-gray-700';
    
    // 使用用户名的哈希值生成颜色
    const hash = user.username.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // 从预定义的颜色列表中选择
    const colors = [
      'bg-blue-600', 'bg-purple-600', 'bg-green-600', 
      'bg-yellow-600', 'bg-red-600', 'bg-pink-600', 
      'bg-indigo-600', 'bg-teal-600'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }, [user?.username]);

  // 根据尺寸设置样式
  const sizeClasses = {
    'xs': 'w-6 h-6 text-xs',
    'sm': 'w-8 h-8 text-sm',
    'md': 'w-10 h-10 text-md',
    'lg': 'w-12 h-12 text-lg',
    'xl': 'w-16 h-16 text-xl'
  };

  // 获取用户名首字母
  const getInitials = () => {
    if (!user?.username) return '?';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${backgroundColor} rounded-full flex items-center justify-center text-white font-medium ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
      onClick={onClick}
    >
      {user?.avatarUrl ? (
        <img 
          src={user.avatarUrl} 
          alt={user?.username || 'User'} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getInitials()
      )}
    </div>
  );
};

export default UserAvatar;
