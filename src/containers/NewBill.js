import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  filePathIsTrue = (path) => {
    let regexPathFile = /(?:jpg$)|(?:png$)|(?:jpeg$)/g
    let filePathIsTrue = regexPathFile.test(path)
    if (filePathIsTrue === true) {
      return true
    }
    else {
      return false
    }
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    console.log(e.target.value)
    const filePath = e.target.value.split(/\\/g)
    // fileName doit se finir par jpg, jpeg ou png uniquement.
    // Si c'est le cas on post la bill sinon on affiche un message d'erreur.
    // let regexPathFile = /(?:jpg$)|(?:png$)|(?:jpeg$)/g
    let errorMessage = document.querySelector(".errorMsg")

    const fileName = filePath[filePath.length - 1]
    // let filePathIsTrue = regexPathFile.test(fileName)
    // console.log(filePathIsTrue)
    // this.filePathIsTrue(fileName)

    if (this.filePathIsTrue(fileName) === true) {
      errorMessage.style.display = "none"
      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({ fileUrl, key }) => {

          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        }).catch(error => console.error(error))

    }
    else {
      errorMessage.style.display = "block"
    }
  }


  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    console.log(e.target.querySelector(`input[data-testid="file"]`).files)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }

    // Test
    let errorMessage = document.querySelector(".errorMsg")
    if (this.filePathIsTrue(bill.fileName) === true) {
      console.log(bill)
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
      errorMessage.style.display = "none"

    }
    else {
      // Insérer dans le dom un message d'erreur

      errorMessage.style.display = "block"
    }
    return bill
    // Test
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch(error => console.error(error))
    }
  }
}