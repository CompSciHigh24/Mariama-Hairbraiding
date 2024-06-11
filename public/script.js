const form = document.querySelector("#appointmentForm");
// console.log(form)


form.addEventListener("submit", (e) => {
  // div.innerHTML = `<h1>Appoitment Saved</h1>`
  e.preventDefault();
  const data = new FormData(form);
  const reqBody = Object.fromEntries(data);
  console.log(reqBody);
  fetch("/appointments", {
    method:"POST",
    headers:{"Content-Type": "application/json"},
    body: JSON.stringify(reqBody)
  })
  .then((response) => {
    if(response.ok){
      window.location.href = "/appointments";
    }else{
      window.location.href = "/500"
    }
  }).catch((error) =>{
    console.error("Error", error);
    res.status(500).send("500 internal server error")
  })
})