import { ObservableObject } from './index'

interface IObject {
  [key: PropertyKey]: any;
}

it ('should fire an observer function when children change', () => {
  const handler = jest.fn()
  const object = new ObservableObject(handler) as IObject

  object.test = true
  expect(handler).toHaveBeenCalledTimes(1)
  expect(object).toEqual({ test: true })
})