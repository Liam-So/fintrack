export const formattedDate = (date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

// Sample output: "2021-01-01"
export const toLocalDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 10);
};


// Sample output: "Jan 2021"
export const toLocalMonth = (dateStr) => {
  const date = new Date(dateStr);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
  
  return formattedDate;
}


export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};