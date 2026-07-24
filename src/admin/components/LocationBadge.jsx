function LocationBadge({ city, region, country }) {
  const label = [city, region, country].filter(Boolean).join(', ')
  return <span className="admin-location-badge">{label || 'Unknown'}</span>
}

export default LocationBadge
