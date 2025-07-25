export const isToday = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const dateMalaysiaStr = date.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
  const dateMalaysia = new Date(dateMalaysiaStr);

  const now = new Date();
  const todayMalaysiaStr = now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"});
  const todayMalaysia = new Date(todayMalaysiaStr);

  return (
    dateMalaysia.getDate() === todayMalaysia.getDate() &&
    dateMalaysia.getMonth() === todayMalaysia.getMonth() &&
    dateMalaysia.getFullYear() === todayMalaysia.getFullYear()
  );
};