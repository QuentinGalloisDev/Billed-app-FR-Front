/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import { data } from "jquery";

jest.mock("../app/Store.js", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      console.log(windowIcon.className)
      expect(windowIcon.className).toBe("active-icon")

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      console.log(dates)
      expect(dates).toEqual(datesSorted)
    })
    describe("When i click on icon eye", () => {
      test("Then the modal show", () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        const store = null
        const billsPage = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })
        const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
        if (iconEye) iconEye.forEach(icon => {
          const handleClickIconEye = jest.fn(billsPage.handleClickIconEye(icon))
          icon.addEventListener('click', handleClickIconEye)
          userEvent.click(icon)
          expect(handleClickIconEye).toHaveBeenCalled()
        })


      })
    })
    describe("When i click on the button new bill", () => {
      test("Then i go to the page newBill", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        const store = null
        const billsPage = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })
        const newBillButton = screen.getByTestId("btn-new-bill")
        //
        const handleClickNewBill = jest.fn(() => billsPage.handleClickNewBill)
        newBillButton.addEventListener("click", handleClickNewBill)
        fireEvent.click(newBillButton)
        expect(handleClickNewBill).toHaveBeenCalled()


      })
    })

  })
  describe("When I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
      test("fetches bills from API", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        localStorage.setItem('user', JSON.stringify({
          type: 'Employee', email: "a@a"
        }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        const table = await waitFor(() => screen.getByTestId("tbody"))
        // Selectionner tout les noeuds contenant les infos.
        let infosInTable = table.getElementsByTagName("td")
        let InfosFoundInTable = false
        for (let i of infosInTable) {
          let infos = i.innerHTML
          let billStatusRegex = /(?:Accepte)|(?:Refused)|(?:En attente)/gmi
          let dateFormatRegex = /(?:\d{4}-\d{2}-\d{2})/gmi
          if (billStatusRegex.test(infos) || dateFormatRegex.test(infos)) {
            InfosFoundInTable = true
          }
        }
        expect(InfosFoundInTable).toBeTruthy()
      })
      describe("When getBills is called", () => {
        test("getBills is called with null", async () => {

          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          localStorage.setItem('user', JSON.stringify({
            type: 'Employee', email: "a@a"
          }));
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.append(root)
          router()
          window.onNavigate(ROUTES_PATH.Bills)

          // Tests unitaires
          // Test ("la fonction getbills est appelé avec un store null, vérifié que la fonction ne renvoiae bien rien du tout ")
          const store = null
          const billsPage = new Bills({
            document,
            onNavigate,
            store: store,
            localStorage: window.localStorage,
          });
          const result = await billsPage.getBills();
          //Result renvoie undefined
          expect(result).toBeFalsy()
        })
        test("The array returned = array in store", async () => {
          // Test ("La fonction getBills est appelée avec un store valide, vérifié si les fonctions bills et list sont bien appelées
          // et si le tableau rendu correspond bien au store envoyé initialement (longueur de 4 comme pour les mockstore)")
          const billsPage = new Bills({
            document,
            onNavigate,
            store: mockStore,
            localStorage: window.localStorage,
          });
          // Spy sur la méthode list du store pour vérifier si elle est appelée
          const listSpy = jest.spyOn(mockStore.bills(), "list");
          // Appelle la méthode getBills de billsPage
          const result = await billsPage.getBills();

          expect(listSpy).toHaveBeenCalledTimes(1);
          // Result renvoie le tableau du store mocké
          expect(result).toHaveLength(4);

        })
      })

      describe("When an errors occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "a@a"
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 404"))
              }
            }
          })
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })
        test("fetches messages from an API and fails with 500 message error", async () => {

          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 500"))
              }
            }
          })

          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    })
  })
})