import { useState, type ReactNode } from 'react'
import { Download, Search } from 'lucide-react'

import { api, downloadFile, messageOf, money, query } from '@/api/http'
import type {
  AutoService,
  Car,
  CarAverageCost,
  CommonServices,
  ExpensiveService,
  Master,
  MasterIncome,
  MasterInfo,
  RevenueByOrigin,
  ServiceCost,
  TopMaster,
} from '@/api/types'
import { useList } from '@/api/useList'
import {
  Alert,
  DataPanel,
  fieldClass,
  FormField,
  TableState,
  td,
  th,
} from '@/components/common/CrudUI'
import { Button } from '@/components/ui/button'

type DownloadItem = {
  label: string
  path: string
  filename: string
}

const downloadItems: DownloadItem[] = [
  {
    label: 'Выручка по услугам (CSV)',
    path: '/api/reports/expensive-services/export',
    filename: 'expensive-services.csv',
  },
  {
    label: 'Доход мастеров (CSV)',
    path: '/api/reports/masters-income/export',
    filename: 'masters-income.csv',
  },
]

const reportButtonClass = [
  'bg-indigo-600 text-white font-medium',
  'hover:bg-indigo-700 hover:text-white',
  'disabled:cursor-not-allowed disabled:bg-indigo-600',
  'disabled:text-white disabled:opacity-100',
].join(' ')

type ReportSectionProps = {
  title: string
  description?: string
  children: ReactNode
}

function ReportSection({ title, description, children }: ReportSectionProps) {
  return (
    <section className="min-w-0 space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </div>
      <DataPanel>{children}</DataPanel>
    </section>
  )
}

export function ReportsPage() {
  const expensive = useList<ExpensiveService>('/api/reports/expensive-services')
  const income = useList<MasterIncome>('/api/reports/masters-income')
  const averages = useList<CarAverageCost>('/api/reports/cars-average-cost')
  const cars = useList<Car>('/api/cars')
  const services = useList<AutoService>('/api/services')
  const masters = useList<Master>('/api/masters')

  const [serviceId, setServiceId] = useState('')
  const [carId, setCarId] = useState('')
  const [serviceCost, setServiceCost] = useState<ServiceCost | null>(null)

  const [master1, setMaster1] = useState('')
  const [master2, setMaster2] = useState('')
  const [common, setCommon] = useState<CommonServices | null>(null)

  const [infoId, setInfoId] = useState('')
  const [info, setInfo] = useState<MasterInfo | null>(null)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [revenue, setRevenue] = useState<RevenueByOrigin | null>(null)

  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [topMasters, setTopMasters] = useState<TopMaster[] | null>(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError('')
    setNotice('')

    try {
      await action()
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setBusy(false)
    }
  }

  function download(item: DownloadItem) {
    void run(async () => {
      await downloadFile(item.path, item.filename)
      setNotice(`Файл «${item.filename}» отправлен на скачивание`)
    })
  }

  return (
    <div className="min-w-0 space-y-8">
      <Alert text={error} />
      <Alert text={notice} success />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {downloadItems.map((item) => (
          <Button
            key={item.path}
            variant="outline"
            disabled={busy}
            onClick={() => download(item)}
            className="h-auto min-h-12 w-full min-w-0 justify-start gap-3 whitespace-normal rounded-xl border-slate-200 bg-white px-5 py-4 text-left text-slate-900 hover:bg-slate-50"
          >
            <Download className="size-5 shrink-0 text-indigo-600" />
            <span className="min-w-0 whitespace-normal break-words leading-snug">
              {item.label}
            </span>
          </Button>
        ))}
      </div>

      <ReportSection
        title="Услуги с высокой выручкой"
        description="Представление expensive_services: общая стоимость строго больше 2000"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Услуга</th>
                <th className={th}>Суммарная стоимость</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <TableState
                loading={expensive.loading}
                error={expensive.error}
                empty={!expensive.items.length}
                colSpan={2}
              />
              {!expensive.loading &&
                !expensive.error &&
                expensive.items.map((row) => (
                  <tr key={row.id}>
                    <td className={td}>{row.name}</td>
                    <td className={td}>{money(row.total_cost)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {expensive.error && <Alert text={expensive.error} />}
      </ReportSection>

      <ReportSection
        title="Доход мастеров за последний год"
        description="Представление masters_income, включая мастеров без работ"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Мастер</th>
                <th className={th}>Выручка по работам</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <TableState
                loading={income.loading}
                error={income.error}
                empty={!income.items.length}
                colSpan={2}
              />
              {!income.loading &&
                !income.error &&
                income.items.map((row) => (
                  <tr key={row.id}>
                    <td className={td}>{row.name}</td>
                    <td className={td}>{money(row.total_income)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {income.error && <Alert text={income.error} />}
      </ReportSection>

      <ReportSection
        title="Средняя стоимость по автомобилям"
        description="Результат процедуры get_cars_avg_cost"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Номер</th>
                <th className={th}>Марка</th>
                <th className={th}>Средняя стоимость</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <TableState
                loading={averages.loading}
                error={averages.error}
                empty={!averages.items.length}
                colSpan={3}
              />
              {!averages.loading &&
                !averages.error &&
                averages.items.map((row) => (
                  <tr key={row.id}>
                    <td className={td}>{row.num}</td>
                    <td className={td}>{row.mark ?? '—'}</td>
                    <td className={td}>{money(row.avg_cost)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {averages.error && <Alert text={averages.error} />}
      </ReportSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection title="Стоимость услуги для автомобиля">
          <div className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Автомобиль" htmlFor="report-car">
                <select
                  id="report-car"
                  className={fieldClass}
                  value={carId}
                  onChange={(e) => {
                    setCarId(e.target.value)
                    setServiceCost(null)
                  }}
                >
                  <option value="">Выбери автомобиль</option>
                  {cars.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.num}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Услуга" htmlFor="report-service">
                <select
                  id="report-service"
                  className={fieldClass}
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value)
                    setServiceCost(null)
                  }}
                >
                  <option value="">Выбери услугу</option>
                  {services.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <Button
              disabled={busy || !carId || !serviceId}
              className={reportButtonClass}
              onClick={() =>
                void run(async () => {
                  setServiceCost(
                    await api<ServiceCost>(
                      `/api/reports/service-cost?${query({ carId, serviceId })}`,
                    ),
                  )
                })
              }
            >
              <Search className="size-4" />
              Рассчитать
            </Button>
            {serviceCost && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-900">
                Количество работ: <strong>{serviceCost.worksCount}</strong>
                <p className="mt-2">
                  Сумма: <strong>{money(serviceCost.totalCost)}</strong>
                </p>
              </div>
            )}
          </div>
        </ReportSection>

        <ReportSection title="Общие виды услуг двух мастеров">
          <div className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Первый мастер" htmlFor="master1">
                <select
                  id="master1"
                  className={fieldClass}
                  value={master1}
                  onChange={(e) => {
                    setMaster1(e.target.value)
                    setCommon(null)
                  }}
                >
                  <option value="">Выбери мастера</option>
                  {masters.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Второй мастер" htmlFor="master2">
                <select
                  id="master2"
                  className={fieldClass}
                  value={master2}
                  onChange={(e) => {
                    setMaster2(e.target.value)
                    setCommon(null)
                  }}
                >
                  <option value="">Выбери мастера</option>
                  {masters.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <Button
              disabled={busy || !master1 || !master2}
              className={reportButtonClass}
              onClick={() =>
                void run(async () => {
                  setCommon(
                    await api<CommonServices>(
                      `/api/reports/common-services?${query({ master1, master2 })}`,
                    ),
                  )
                })
              }
            >
              <Search className="size-4" />
              Сравнить
            </Button>
            {common && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-900">
                Общих видов услуг: <strong>{common.servicesCount}</strong>
              </div>
            )}
          </div>
        </ReportSection>

        <ReportSection title="Карточка мастера из PostgreSQL JSONB">
          <div className="space-y-4 p-5">
            <FormField label="Мастер" htmlFor="info-master">
              <select
                id="info-master"
                className={fieldClass}
                value={infoId}
                onChange={(e) => {
                  setInfoId(e.target.value)
                  setInfo(null)
                }}
              >
                <option value="">Выбери мастера</option>
                {masters.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>
            <Button
              disabled={busy || !infoId}
              className={reportButtonClass}
              onClick={() =>
                void run(async () => {
                  setInfo(await api<MasterInfo>(`/api/reports/masters/${infoId}/info`))
                })
              }
            >
              <Search className="size-4" />
              Показать
            </Button>
            {info && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-900">
                <p>
                  Имя: <strong>{info.master_name}</strong>
                </p>
                <p className="mt-2">
                  Работ за текущий месяц: <strong>{info.works_count_current_month}</strong>
                </p>
                <p className="mt-2">
                  Автомобили:{' '}
                  {info.serviced_cars.length ? info.serviced_cars.join(', ') : 'нет'}
                </p>
              </div>
            )}
          </div>
        </ReportSection>

        <ReportSection title="Выручка: отечественные и иностранные">
          <div className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Дата с" htmlFor="revenue-from">
                <input
                  id="revenue-from"
                  type="date"
                  className={fieldClass}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setRevenue(null)
                  }}
                />
              </FormField>
              <FormField label="Дата по" htmlFor="revenue-to">
                <input
                  id="revenue-to"
                  type="date"
                  className={fieldClass}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setRevenue(null)
                  }}
                />
              </FormField>
            </div>
            <Button
              disabled={busy || (!!startDate && !!endDate && startDate > endDate)}
              className={reportButtonClass}
              onClick={() =>
                void run(async () => {
                  setRevenue(
                    await api<RevenueByOrigin>(
                      `/api/reports/revenue-by-origin?${query({ startDate, endDate })}`,
                    ),
                  )
                })
              }
            >
              <Search className="size-4" />
              Рассчитать
            </Button>
            {revenue && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-900">
                <p>
                  Отечественные: <strong>{money(revenue.domesticTotal)}</strong>
                </p>
                <p className="mt-2">
                  Иностранные: <strong>{money(revenue.foreignTotal)}</strong>
                </p>
                <p className="mt-2">
                  Всего:{' '}
                  <strong>
                    {money(Number(revenue.domesticTotal) + Number(revenue.foreignTotal))}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </ReportSection>
      </div>

      <ReportSection
        title="Топ-5 мастеров по обслуженным автомобилям"
        description="Рейтинг за выбранный календарный месяц, по количеству разных автомобилей"
      >
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="Месяц" htmlFor="report-month">
              <input
                id="report-month"
                type="month"
                className={fieldClass}
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value)
                  setTopMasters(null)
                }}
              />
            </FormField>
            <Button
              disabled={busy || !month}
              className={reportButtonClass}
              onClick={() =>
                void run(async () => {
                  setTopMasters(
                    await api<TopMaster[]>(
                      `/api/reports/top-masters?${query({ month })}`,
                    ),
                  )
                })
              }
            >
              <Search className="size-4" />
              Показать
            </Button>
          </div>
          {topMasters !== null && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={th}>Мастер</th>
                    <th className={th}>Разных автомобилей</th>
                    <th className={th}>Работ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topMasters.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500">
                        Данные отсутствуют
                      </td>
                    </tr>
                  )}
                  {topMasters.map((item) => (
                    <tr key={item.id}>
                      <td className={td}>{item.name}</td>
                      <td className={td}>{item.distinctCarsCount}</td>
                      <td className={td}>{item.worksCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ReportSection>
    </div>
  )
}
