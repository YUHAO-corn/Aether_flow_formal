import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RiImageAddLine, RiCloseLine, RiDownloadLine, RiFileCopyLine } from 'react-icons/ri';

const PromptImage = ({ reducedMotion }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 处理图片上传
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (!file.type.match('image.*')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prevImages => [
          ...prevImages,
          {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            src: e.target.result,
            name: file.name,
            date: new Date().toISOString()
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // 打开图片模态框
  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };
  
  // 关闭图片模态框
  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };
  
  // 复制图片链接
  const copyImageLink = (src) => {
    navigator.clipboard.writeText(src)
      .then(() => {
        alert('图片链接已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };
  
  // 下载图片
  const downloadImage = (src, name) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="p-2 h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[0.7rem] font-semibold text-white">提示词图像</h2>
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-[0.6rem] py-0.5 px-1 rounded flex items-center">
          <RiImageAddLine size={10} className="mr-1" />
          <span>上传图像</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>
      
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-24 bg-gray-800/50 rounded border border-dashed border-gray-700 text-gray-400">
          <RiImageAddLine size={16} className="mb-1" />
          <p className="text-[0.6rem]">上传图像以创建提示词</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
          {images.map(image => (
            <motion.div
              key={image.id}
              className="relative bg-gray-800 rounded overflow-hidden cursor-pointer group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              onClick={() => openImageModal(image)}
            >
              <img 
                src={image.src} 
                alt={image.name}
                className="w-full h-12 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[0.5rem] text-white">{formatDate(image.date)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* 图片模态框 */}
      {isModalOpen && selectedImage && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <div className="bg-gray-900 rounded-lg overflow-hidden max-w-[80%] max-h-[80vh]">
            <div className="flex justify-between items-center p-1 bg-gray-800">
              <h3 className="text-[0.6rem] text-white truncate">{selectedImage.name}</h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={closeImageModal}
              >
                <RiCloseLine size={12} />
              </button>
            </div>
            
            <div className="p-1">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.name}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
            
            <div className="flex justify-end p-1 bg-gray-800">
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white text-[0.5rem] py-0.5 px-1 rounded flex items-center mr-1"
                onClick={() => copyImageLink(selectedImage.src)}
              >
                <RiFileCopyLine size={8} className="mr-0.5" />
                <span>复制链接</span>
              </button>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[0.5rem] py-0.5 px-1 rounded flex items-center"
                onClick={() => downloadImage(selectedImage.src, selectedImage.name)}
              >
                <RiDownloadLine size={8} className="mr-0.5" />
                <span>下载</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PromptImage; 