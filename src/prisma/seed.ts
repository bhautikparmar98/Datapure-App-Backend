import { PrismaClient } from '@prisma/client'
import ActionTypes from './seeds/ActionTypes'
import ProductCategories from './seeds/ProductCategories'
import ProductLimitations from './seeds/ProductLimitations'
import ProductStatuses from './seeds/ProductStatus'
import ProductVariantTypes from './seeds/ProductVariantTypes'
import PropagationMethods from './seeds/PropagationMethods'
import QuantityTypes from './seeds/QuantityTypes'
import SizeTypes from './seeds/SizeTypes'
import SoilMix from './seeds/SoilMix'
import TaskColumns from './seeds/TaskColumn'
import TaskTypes from './seeds/TaskType'

const db = new PrismaClient()

const SoilMixSeed = async () => {
  console.log('Soil Mix: Seeding started')
  console.log('Soil Mix: Checking if data exists')
  const soil_mix_count = await db.sizeType.count()
  console.log(`Soil Mix: ${soil_mix_count} rows found`)
  console.log('Soil Mix: Seeding data')
  for (let i = 0; i < SoilMix.length; i++) {
    const soilMixName = SoilMix[i]
    const exists = await db.soilmix.count({ where: { name: soilMixName } })
    if (exists === 0) {
      await db.soilmix.create({
        data: {
          name: soilMixName
        }
      })
      console.log('soilMix created: ', soilMixName)
    }
  }
  console.log('Soil Mix: Seeding finished')
}

const SizeTypesSeed = async () => {
  console.log('Size Types: Seeding started')
  console.log('Size Types: Checking if data exists')
  const size_types_count = await db.sizeType.count()
  console.log(`Size Types: ${size_types_count} rows found`)
  console.log('Size Types: Seeding data')
  for (let i = 0; i < SizeTypes.length; i++) {
    const sizeTypeName = SizeTypes[i]
    const exists = await db.sizeType.count({ where: { size_cd: sizeTypeName } })
    if (exists === 0) {
      await db.sizeType.create({
        data: {
          size_cd: sizeTypeName
        }
      })
      console.log('sizeType created: ', sizeTypeName)
    }
  }
  console.log('Size Types: Seeding finished')
}

const QuantityTypesSeed = async () => {
  console.log('Quantity Types: Seeding started')
  console.log('Quantity Types: Checking if data exists')
  const quantity_types_count = await db.quantityType.count()
  console.log(`Quantity Types: ${quantity_types_count} rows found`)
  console.log('Quantity Types: Seeding data')
  for (let i = 0; i < QuantityTypes.length; i++) {
    const quantityTypeName = QuantityTypes[i]
    const exists = await db.quantityType.count({ where: { quantity_type_cd: quantityTypeName } })
    if (exists === 0) {
      await db.quantityType.create({
        data: {
          quantity_type_cd: quantityTypeName
        }
      })
      console.log('quantityType created: ', quantityTypeName)
    }
  }
  console.log('Quantity Types: Seeding finished')
}

const ActionTypesSeed = async () => {
  console.log('Action Types: Seeding started')
  console.log('Action Types: Checking if data exists')
  const action_types_count = await db.actionType.count()
  console.log(`Action Types: ${action_types_count} rows found`)
  console.log('Action Types: Seeding data')
  for (let i = 0; i < ActionTypes.length; i++) {
    const actionTypeName = ActionTypes[i]
    const exists = await db.actionType.count({ where: { action_cd: actionTypeName } })
    if (exists === 0) {
      await db.actionType.create({
        data: {
          action_cd: actionTypeName
        }
      })
      console.log('actionType created: ', actionTypeName)
    }
  }
  console.log('Action Types: Seeding finished')
}

const PropagationMethodsSeed = async () => {
  console.log('Propagation Method: Seeding started')
  console.log('Propagation Method: Checking if data exists')
  const propagation_method_count = await db.propagationMethod.count()
  console.log(`Propagation Method: ${propagation_method_count} rows found`)
  console.log('Propagation Method: Seeding data')
  for (let i = 0; i < PropagationMethods.length; i++) {
    const propagationMethodName = PropagationMethods[i]
    const exists = await db.propagationMethod.count({ where: { method_name: propagationMethodName } })
    if (exists === 0) {
      await db.propagationMethod.create({
        data: {
          method_name: propagationMethodName
        }
      })
      console.log('propagationMethod created: ', propagationMethodName)
    }
  }
  console.log('Propagation Method: Seeding finished')
}

const ProductStatusSeed = async () => {
  console.log('Product Status: Seeding started')
  console.log('Product Status: Checking if data exists')
  const product_status_count = await db.productStatus.count()
  console.log(`Product Status: ${product_status_count} rows found`)
  console.log('Product Status: Seeding data')
  for (let i = 0; i < ProductStatuses.length; i++) {
    const status = ProductStatuses[i]
    const exists = await db.productStatus.count({ where: { title: status } })
    if (exists === 0) {
      await db.productStatus.create({
        data: {
          title: status
        }
      })
      console.log('status created: ', status)
    }
  }
  console.log('Product Status: Seeding finished')
}

const TaskColumnSeed = async () => {
  console.log('Task Column: Seeding started')
  console.log('Task Column: Checking if data exists')
  const TaskColumn_count = await db.taskColumn.count()
  console.log(`Task Column: ${TaskColumn_count} rows found`)
  if (TaskColumn_count == 0) {
    console.log('Task Column: Seeding data')
    for (let i = 0; i < TaskColumns.length; i++) {
      const col = TaskColumns[i]
      await db.taskColumn.create({
        data: {
          name: col
        }
      })
    }
    console.log('Task Column: Seeding finished')
  }
}
const TaskTypeSeed = async () => {
  console.log('Task Type: Seeding started')
  console.log('Task Type: Checking if data exists')
  const TaskTypes_count = await db.taskType.count()
  console.log(`Task Type: ${TaskTypes_count} rows found`)
  if (TaskTypes_count == 0) {
    console.log('Task Type: Seeding data')

    for (let i = 0; i < TaskTypes.length; i++) {
      const type = TaskTypes[i]
      await db.taskType.create({
        data: {
          name: type
        }
      })
    }
    console.log('Task Type: Seeding finished')
  }
}

const ProductLimitationsSeed = async () => {
  console.log('Product Limitations: Seeding started')
  console.log('Product Limitations: Checking if data exists')
  const product_limitation_count = await db.productLimitation.count()
  console.log(`Product Limitations: ${product_limitation_count} rows found`)
  console.log('Product Limitations: Seeding data')

  for (let i = 0; i < ProductLimitations.length; i++) {
    const limitation = ProductLimitations[i]
    const exists = await db.productLimitation.count({ where: { name: limitation } })

    if (exists === 0) {
      await db.productLimitation.create({
        data: {
          name: limitation,
          description: '',
          default: i === 0 // only true for first line, which is "No Limit"
        }
      })
      console.log('limitation created: ', limitation)
    }
  }
  console.log('Product Limitation: Seeding finished')
}

const ProductCategoriesSeed = async () => {
  console.log('Product Categories: Seeding started')
  console.log('Product Categories: Checking if data exists')
  const product_category_count = await db.productCategory.count()
  console.log(`Product Categories: ${product_category_count} rows found`)
  console.log('Product Categories: Seeding data')

  for (let i = 0; i < ProductCategories.length; i++) {
    const category = ProductCategories[i]
    const exists = await db.productCategory.count({ where: { name: category } })

    if (exists === 0) {
      await db.productCategory.create({
        data: {
          name: category
        }
      })
      console.log('category created: ', category)
    }
  }
  console.log('Product category: Seeding finished')
}

const ProductVariantTypesSeed = async () => {
  console.log('ProductVariantType: Seeding started')
  console.log('ProductVariantType: Checking if data exists')
  const productVariantType_count = await db.productVariantType.count()
  console.log(`ProductVariantType: ${productVariantType_count} rows found`)
  console.log('ProductVariantType: Seeding data')

  for (let i = 0; i < ProductVariantTypes.length; i++) {
    const productVariantType = ProductVariantTypes[i]
    const exists = await db.productVariantType.count({ where: { text: productVariantType } })

    if (exists === 0) {
      await db.productVariantType.create({
        data: {
          text: productVariantType
        }
      })
      console.log('productVariantType created: ', productVariantType)
    }
  }
  console.log('productVariantType: Seeding finished')
}

async function main() {
  await ProductStatusSeed()
  await TaskColumnSeed()
  await TaskTypeSeed()
  await ProductLimitationsSeed()
  await ProductCategoriesSeed()
  await PropagationMethodsSeed()
  await ActionTypesSeed()
  await QuantityTypesSeed()
  await SizeTypesSeed()
  await SoilMixSeed()
  await ProductVariantTypesSeed()
}
main()
  .catch(async (e) => {
    await db.$disconnect()
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
