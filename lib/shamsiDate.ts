import jalaali from "jalaali-js";


export const ShamsiDate = (dateString?: string | null) => {
  if (!dateString) return "—";

  const d = new Date(dateString);

  if (isNaN(d.getTime())) return "—";


  const tehranDate = new Date(
    d.toLocaleString("en-US", { timeZone: "Asia/Tehran" })
  );
  const j = jalaali.toJalaali(tehranDate);

  const y = j.jy;
  const m = j.jm.toString().padStart(2, "0");
  const da = j.jd.toString().padStart(2, "0");

  const time = tehranDate.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tehran",
  });

  return `${y}/${m}/${da} - ${time}`;
};
