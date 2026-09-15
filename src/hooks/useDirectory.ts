import { api } from 'api/client'
import type { CustomerView, LocationView, PageResponse, UserResponse, VehicleSummary } from 'api/types'
import useQuery from './useQuery'

const SIZE = 200

/**
 * The lists a form picks from — cars, customers, locations and the mechanics — fetched once and
 * cached, so a screen can offer a choice without a request per keystroke.
 */
const useDirectory = () => {
    const vehicles = useQuery({
        queryKey: ['directory', 'vehicles'],
        queryFn: async () =>
            (await api.get<PageResponse<VehicleSummary>>('/vehicles', { params: { size: SIZE } })).data,
        staleTime: 5 * 60_000,
    })

    const customers = useQuery({
        queryKey: ['directory', 'customers'],
        queryFn: async () => (await api.get<PageResponse<CustomerView>>('/customers', { params: { size: SIZE } })).data,
        staleTime: 5 * 60_000,
    })

    const locations = useQuery({
        queryKey: ['directory', 'locations'],
        queryFn: async () => (await api.get<LocationView[]>('/locations', { params: { activeOnly: true } })).data,
        staleTime: 5 * 60_000,
    })

    /* Only colleagues holding MECHANIC can be handed work; the backend refuses anybody else. */
    const mechanics = useQuery({
        queryKey: ['directory', 'mechanics'],
        queryFn: async () =>
            (await api.get<PageResponse<UserResponse>>('/users', { params: { role: 'MECHANIC', size: SIZE } })).data,
        staleTime: 5 * 60_000,
    })

    const vehicleLabel = (vehicleId?: string | null) => {
        const vehicle = vehicles.data?.items.find((item) => item.id === vehicleId)
        return vehicle ? `${vehicle.label} — ${vehicle.registrationPlate}` : '—'
    }

    const memberName = (member: UserResponse) =>
        [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email

    return {
        vehicleLabel,
        vehicles: vehicles.data?.items ?? [],
        customers: customers.data?.items ?? [],
        locations: locations.data ?? [],
        mechanics: (mechanics.data?.items ?? []).map((member) => ({ id: member.id, name: memberName(member) })),
    }
}

export default useDirectory
