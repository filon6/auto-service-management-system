export type Car = {
  id: number
  num: string
  color: string | null
  mark: string | null
  isForeign: boolean
}

export type CarRequest = Omit<Car, 'id'>

export type Master = {
  id: number
  name: string
}

export type MasterRequest = Pick<Master, 'name'>

export type AutoService = {
  id: number
  name: string
  costOur: number
  costForeign: number
}

export type AutoServiceRequest = Omit<AutoService, 'id'>

export type Work = {
  id: number
  dateWork: string
  masterId: number
  masterName: string
  carId: number
  carNum: string
  serviceId: number
  serviceName: string
}

export type WorkRequest = Pick<Work, 'dateWork' | 'masterId' | 'carId' | 'serviceId'>

// SELECT * FROM PostgreSQL VIEW: JDBC возвращает snake_case ключи.
export type ExpensiveService = {
  id: number
  name: string
  total_cost: number
}

export type MasterIncome = {
  id: number
  name: string
  total_income: number
}

export type CarAverageCost = {
  id: number
  num: string
  mark: string | null
  avg_cost: number
}

export type ServiceCost = {
  serviceId: number
  carId: number
  totalCost: number
  worksCount: number
}

export type CommonServices = {
  master1Id: number
  master2Id: number
  servicesCount: number
}

export type MasterInfo = {
  master_id: number
  master_name: string
  works_count_current_month: number
  serviced_cars: string[]
}

export type RevenueByOrigin = {
  domesticTotal: number
  foreignTotal: number
}

export type TopMaster = {
  id: number
  name: string
  worksCount: number
  distinctCarsCount: number
}
