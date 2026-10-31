export async function lookupIndianPincode(pincode, { signal } = {}) {
  if (!/^[1-9]\d{5}$/.test(pincode)) {
    throw new Error('Enter a valid 6-digit Indian PIN code.');
  }

  const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, { signal });
  if (!response.ok) {
    throw new Error('PIN code lookup is temporarily unavailable. Please try again.');
  }

  const [result] = await response.json();
  const postOffice = result?.Status === 'Success' ? result.PostOffice?.[0] : null;
  if (!postOffice) {
    throw new Error('We could not find an address for this PIN code.');
  }

  return {
    city: postOffice.District,
    state: postOffice.State,
    country: postOffice.Country,
    area: postOffice.Name,
  };
}
