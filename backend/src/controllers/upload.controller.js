import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Get folder from query param (e.g. ?folder=posts or ?folder=products)
        const folder = req.query.folder || 'general';

        // Upload buffer to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `harvesthub/${folder}`,
                    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

export const deleteImage = async (req, res) => {
    const { publicId } = req.body;

    try {
        if (!publicId) {
            return res.status(400).json({ message: 'Public ID is required' });
        }

        await cloudinary.uploader.destroy(publicId);

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
};
