function DeviceBadge({ browser, device }) {
  const label = [browser, device].filter(Boolean).join(' · ')
  return <span className="admin-device-badge">{label || 'Unknown'}</span>
}

export default DeviceBadge
