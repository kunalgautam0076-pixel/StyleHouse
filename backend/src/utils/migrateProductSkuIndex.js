import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
mongoose.set('autoIndex', false);

const { default: Product } = await import('../models/Product.js');
const skuPath = 'variants.sku';

try {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const duplicateSkus = await Product.aggregate([
    { $unwind: '$variants' },
    { $match: { [`${skuPath}`]: { $type: 'string' } } },
    { $group: { _id: `$${skuPath}`, productIds: { $addToSet: '$_id' } } },
    { $match: { $expr: { $gt: [{ $size: '$productIds' }, 1] } } },
    { $limit: 1 },
  ]);

  if (duplicateSkus.length) {
    throw new Error(`SKU ${duplicateSkus[0]._id} is assigned to multiple products.`);
  }

  const indexes = await Product.collection.indexes();
  const skuIndex = indexes.find(index => index.key?.[skuPath] === 1);
  const hasPartialUniqueSkuIndex = skuIndex?.unique === true
    && skuIndex.partialFilterExpression?.[skuPath]?.$type === 'string';

  if (skuIndex && !hasPartialUniqueSkuIndex) {
    await Product.collection.dropIndex(skuIndex.name);
  }

  if (!hasPartialUniqueSkuIndex) {
    await Product.collection.createIndex(
      { [skuPath]: 1 },
      {
        unique: true,
        partialFilterExpression: { [skuPath]: { $type: 'string' } },
        name: 'variants.sku_1',
      }
    );
  }

  console.log('Product SKU index migration completed.');
} catch (error) {
  console.error(`Product SKU index migration failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}