import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 } from 'cloudinary';
import * as toStream from 'buffer-to-stream';

jest.mock('cloudinary');
jest.mock('buffer-to-stream');

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload an image file successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockResult = { public_id: 'test_image' };

      (v2.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, mockResult);
          return { pipe: jest.fn() };
        },
      );

      (toStream as jest.Mock).mockReturnValue({ pipe: jest.fn() });

      const result = await service.uploadFile(mockFile);

      expect(result).toEqual(mockResult);
      expect(v2.uploader.upload_stream).toHaveBeenCalledWith(
        { resource_type: 'image' },
        expect.any(Function),
      );
    });

    it('should upload a video file successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'video/mp4',
      } as Express.Multer.File;

      const mockResult = { public_id: 'test_video' };

      (v2.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, mockResult);
          return { pipe: jest.fn() };
        },
      );

      (toStream as jest.Mock).mockReturnValue({ pipe: jest.fn() });

      const result = await service.uploadFile(mockFile);

      expect(result).toEqual(mockResult);
      expect(v2.uploader.upload_stream).toHaveBeenCalledWith(
        { resource_type: 'video' },
        expect.any(Function),
      );
    });

    it('should reject if upload fails', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockError = new Error('Upload failed');

      (v2.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(mockError, null);
          return { pipe: jest.fn() };
        },
      );

      (toStream as jest.Mock).mockReturnValue({ pipe: jest.fn() });

      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        'Upload failed',
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const publicId = 'test_image';

      (v2.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

      await service.deleteFile(publicId);

      expect(v2.uploader.destroy).toHaveBeenCalledWith(publicId);
    });

    it('should throw an error if deletion fails', async () => {
      const publicId = 'test_image';

      (v2.uploader.destroy as jest.Mock).mockRejectedValue(
        new Error('Deletion failed'),
      );

      await expect(service.deleteFile(publicId)).rejects.toThrow(
        'Deletion failed',
      );
    });
  });
});
