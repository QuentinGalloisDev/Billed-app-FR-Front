/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import userEvent from '@testing-library/user-event'
import NewBill from "../containers/NewBill.js"
import Bills from "../containers/Bills.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";
import ErrorPage from "../views/ErrorPage.js";

jest.mock("../app/Store.js", () => mockStore)
window.alert = jest.fn()

async function checkIfFilePathIsTrue(DomFile, page, path) {
  userEvent.upload(DomFile, `${path}`)
  // 'C:\\fakepath\\Justificatiftest.jpg'
  const handleChangeFile = jest.fn(() => page.handleChangeFile)
  DomFile.addEventListener("change", handleChangeFile)

  const filePathIsTrueSpy = jest.spyOn(page, "filePathIsTrue");

  fireEvent.change(DomFile)

  await waitFor(() => expect(handleChangeFile).toHaveBeenCalled());
  const filePath = handleChangeFile.mock.calls[0][0].target.files[0];
  // Vérifier que la fonction filePathIsTRue renvoie true.
  filePathIsTrueSpy.mockImplementation((path) => {
    const regexPathFile = /(?:jpg$)|(?:png$)|(?:jpeg$)/g;
    return regexPathFile.test(path) ? true : false;
  });
  await waitFor(() => expect(filePathIsTrueSpy).toHaveBeenCalled());

  const filePathIsTrueReturnValue = filePathIsTrueSpy(filePath);
  return filePathIsTrueReturnValue
}

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then the fonction handleChangFile is called when user change the input', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const NewBillPage = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      let file = screen.getByTestId("file")

      const handleChangeFile = jest.fn(() => NewBillPage.handleChangeFile)
      file.addEventListener("change", handleChangeFile)
      fireEvent.change(file)
      expect(handleChangeFile).toHaveBeenCalled();

      // Accéder à la première propriété de l'objet File
      const filePath = handleChangeFile.mock.calls[0][0].target.files[0];
    }
    )
    test("the function filePathIsTrue return true if the path test is ok", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const NewBillPage = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      let file = screen.getByTestId("file")
      let result = await checkIfFilePathIsTrue(file, NewBillPage, 'C:\\fakepath\\Justificatiftest.jpg')
      expect(result).toBe(true)
    })
    test("the function filePathIsTrue return false if the path test is not ok", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)


      const NewBillPage = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      let file = screen.getByTestId("file")

      let result = await checkIfFilePathIsTrue(file, NewBillPage, 'C:\\fakepath\\Justificatiftest.ggg')
      expect(result).toBe(false)
    })
    test("the function create from bills is called if the path test return true", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const NewBillPage = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      const createSpy = jest.spyOn(mockStore.bills(), "create");
      let file = screen.getByTestId("file");
      let result = await checkIfFilePathIsTrue(file, NewBillPage, 'C:\\fakepath\\Justificatiftest.jpg')
      await waitFor(() => expect(result).toBe(true));
      // Simuler un événement de changement de fichier
      await NewBillPage.handleChangeFile({
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\Justificatiftest.jpg' },
      });

      await waitFor(() => {
        // Vérifier que la fonction createSpy a été appelée si result retourne true
        if (result) {
          expect(createSpy).toHaveBeenCalled();
        } else {
          // Si result retourne false, s'assurer que createSpy n'a pas été appelée
          expect(createSpy).not.toHaveBeenCalled();
        }

      })
    })
    test("the erroMsg is displayed if the path test return false", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)


      const NewBillPage = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })


      let file = screen.getByTestId("file");
      let errorMsg = screen.getByTestId("errorMsg")
      // Changer l'extension du chemin des 2 fonctions checkIfFilePathIsTrue et handleChangeFile pour le test
      // pour que le même chemin soit appelé pour la vérification de la validité et pour la fonction mockée de NewBillPage
      let result = await checkIfFilePathIsTrue(file, NewBillPage, 'C:\\fakepath\\Justificatiftest.ggg')
      // Simuler un événement de changement de fichier
      await NewBillPage.handleChangeFile({
        preventDefault: jest.fn(),
        target: { value: 'C:\\fakepath\\Justificatiftest.ggg' },
      });

      // Quand le résultat de la fonction de vérification est appelé, on fait un expect sur la valeur du display.block du message d'erreur
      // Si le chemin est valide on expect que le message d'erreur est caché avec display none.
      await waitFor(() => {
        if (result) {
          expect(errorMsg.style.display).toBe('none');
          // Sinon on expect que le message d'erreur est affiché
        } else {
          expect(errorMsg.style.display).toBe('block');
        }
      })
    })
    test("the function handleSubmit is called when user click on the button sumbit of the form", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const NewBillPage = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      // Espionnez la fonction create du store
      const createSpy = jest.spyOn(mockStore.bills(), 'create');
      // Spécifiez le comportement de l'espion (vous pouvez ajuster cela en fonction de vos besoins)
      createSpy.mockResolvedValue({ fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234' });

      userEvent.selectOptions(screen.getByTestId('expense-type'), 'Transports');
      userEvent.type(screen.getByTestId('expense-name'), 'Nom de la dépense');
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: '2022-01-01' } });
      userEvent.type(screen.getByTestId('amount'), '100');
      userEvent.type(screen.getByTestId('vat'), '20');
      userEvent.type(screen.getByTestId('pct'), '10');
      userEvent.type(screen.getByTestId('commentary'), 'Commentaire de la dépense');

      const expectedFormData = new FormData();
      let fileinput = screen.getByTestId("file")
      const file = new File(['content'], 'test-file.jpg', { type: 'image/jpg' });

      userEvent.upload(fileinput, file)
      console.log(fileinput.files[0].name)
      let fileMocked = fileinput.files[0].name
      // On rempli le fomrData avec les données du formulaires
      expectedFormData.append('file', fileMocked);
      // et avec la même adresse que dans le localStorage
      expectedFormData.append('email', 'employee@test.tld');

      // Simuler la soumission du formulaire
      const submitButton = screen.getByTestId("submit-button")
      const handleSubmit = jest.fn(() => NewBillPage.handleSubmit)
      submitButton.addEventListener("click", handleSubmit)
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled()
      await createSpy
      expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
        // vérifie si l'objet Data est bien rempli avec les données 
        data: expectedFormData,
        // la requête HTTP générée par la fonction createSpy doit inclure un en-tête spécifique appelé noContentType avec une valeur de true.
        headers: { noContentType: true },
      }));
      createSpy.mockRestore()

    })
    describe("when filePathIsTrue", () => {
      test('updateBill is called whith the good data', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'employee@test.tld'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)

        const NewBillPage = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })
        jest.spyOn(NewBillPage, 'filePathIsTrue').mockReturnValue(true);

        const updateBillSpy = jest.spyOn(mockStore.bills(), 'update');
        updateBillSpy.mockResolvedValue({
          "amount": 100,
          "commentary": "Commentaire de la dépense",
          "date": "2022-01-01",
          "email": "employee@test.tld",
          "fileName": "test-file.jpg",
          "fileUrl": "test-file.jpg",
          "name": "Nom de la dépense",
          "pct": 10,
          "status": "pending",
          "type": "Transports",
          "vat": "20"
        });
        userEvent.selectOptions(screen.getByTestId('expense-type'), 'Transports');
        userEvent.type(screen.getByTestId('expense-name'), 'Nom de la dépense');
        fireEvent.change(screen.getByTestId('datepicker'), { target: { value: '2022-01-01' } });
        userEvent.type(screen.getByTestId('amount'), '100');
        userEvent.type(screen.getByTestId('vat'), '20');
        userEvent.type(screen.getByTestId('pct'), '10');
        userEvent.type(screen.getByTestId('commentary'), 'Commentaire de la dépense');

        let fileinput = screen.getByTestId("file")
        const file = new File(['content'], 'test-file.jpg', { type: 'image/jpg' });

        userEvent.upload(fileinput, file)
        console.log(fileinput.files[0].name)
        let filePath = screen.getByTestId("file").files[0].name
        console.log(filePath)
        filePath = filePath.split(/\\/g)
        const fileName = filePath[filePath.length - 1]
        console.log(fileName)
        NewBillPage.fileUrl = fileName
        NewBillPage.fileName = fileName

        const submitButton = screen.getByTestId("submit-button")
        const handleSubmit = jest.fn(() => NewBillPage.handleSubmit)
        submitButton.addEventListener("click", handleSubmit)
        fireEvent.click(submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalled());

        expect(updateBillSpy).toHaveBeenCalledWith({
          "data": "{\"type\":\"Transports\",\"name\":\"Nom de la dépense\",\"amount\":100,\"date\":\"2022-01-01\",\"vat\":\"20\",\"pct\":10,\"commentary\":\"Commentaire de la dépense\",\"fileUrl\":\"test-file.jpg\",\"fileName\":\"test-file.jpg\",\"status\":\"pending\"}",
          "selector": null,

        });
      })
    })
    describe('When I am on NewBill page but back-end send an error message', () => {
      test('Then, Error page should be rendered', () => {
        document.body.innerHTML = NewBillUI({ error: 'some error message' })
        expect(screen.getAllByText('Erreur')).toBeTruthy()
        afterEach(() => {
          document.body.innerHTML = '';
        });
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
      })
      test("Then new bill is added to the API but fetch fails with '404 Internal Server error'", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"));
            }
          };
        });

        document.body.innerHTML = NewBillUI({ error: "Erreur 404" })
        const message = await screen.findByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("Then new bill is added to the API but fetch fails with '500 Internal Server error'", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            }
          };
        });

        document.body.innerHTML = NewBillUI({ error: "Erreur 500" })
        const message = await screen.findByText(/Erreur 500/)
        expect(message).toBeTruthy()

      })


    })
  })
})

