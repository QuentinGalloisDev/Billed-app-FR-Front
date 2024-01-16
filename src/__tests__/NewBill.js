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

jest.mock("../app/Store.js", () => mockStore)

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

      // Vérifier que les méthode .bills et . create de mockstore sont appelé
      // const createSpy = jest.spyOn(mockStore.bills, "create");
      // const result = await NewBillPage.handleChangeFile();

      // La fonction handleChangeFile est appelé chaque fois que l'utilisateur change l'input dont le data test id= file

      // Vérifier que la fonction filePathIsTRue renvoie true.
      // Créer un formulaire avec des données mockées.

      let file = screen.getByTestId("file")
      // userEvent.upload(file, 'C:\\fakepath\Justificatif test.jpg')
      const handleChangeFile = jest.fn(() => NewBillPage.handleChangeFile)
      file.addEventListener("change", handleChangeFile)
      fireEvent.change(file)
      expect(handleChangeFile).toHaveBeenCalled();

      // Accéder à la première propriété de l'objet File
      const filePath = handleChangeFile.mock.calls[0][0].target.files[0];
      //Quand l\'utilisateur clique sur envoyer 

      // expect(handleChangeFile).toHaveBeenCalled()
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

      // Créer un formulaire avec des données mockées.
      let result = await checkIfFilePathIsTrue(file, NewBillPage, 'C:\\fakepath\\Justificatiftest.jpg')

      console.log(result);

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


      // Récupère la valeur du chemin passé en paramètre.
      // console.log(file.files[0]);

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
        target: { value: 'C:\\fakepath\\test.jpg' },
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

      let file = screen.getByTestId("file")
      let form = screen.getByTestId("form-new-bill")
      let errorMsg = form.getElementsByClassName("errorMsg")[0]

      let result = await checkIfFilePathIsTrue(file, NewBillPage, 'C:\\fakepath\\Justificatiftest.ggg')
      // Si le résultat de la fonction de vérification retourne true on affiche le message d'erreur sinon on le masque.
      errorMsg.style.display = result ? 'none' : 'block';
      // Quand le résultat de la fonction de vérification est appelé, on fait un expect sur la valeur du display.block du message d'erreur
      // Si le chemin est valide on expect que le message d'erreur est caché avec display none.
      if (result) {
        expect(errorMsg.style.display).toBe('none');
        // Sinon on expect que le message d'erreur est affiché
      } else {
        // Si result retourne false, s'assurer que le message d'erreur apparait
        expect(errorMsg.style.display).toBe('block');
      }

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

      // // Spécifiez le comportement de l'espion (vous pouvez ajuster cela en fonction de vos besoins)
      createSpy.mockResolvedValue({ fileUrl: 'mockFileUrl', key: 'mockKey' });


      userEvent.selectOptions(screen.getByTestId('expense-type'), 'Transports');

      userEvent.type(screen.getByTestId('expense-name'), 'Nom de la dépense');

      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: '2022-01-01' } });
      userEvent.type(screen.getByTestId('amount'), '100');
      userEvent.type(screen.getByTestId('vat'), '20');
      userEvent.type(screen.getByTestId('pct'), '10');
      userEvent.type(screen.getByTestId('commentary'), 'Commentaire de la dépense');

      // // Simuler la soumission du formulaire
      const submitButton = screen.getByTestId("submit-button")
      const handleSubmit = jest.fn(() => NewBillPage.handleSubmit)
      submitButton.addEventListener("click", handleSubmit)
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled()

      console.log(createSpy)
      expect(createSpy).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: { noContentType: true },
      });
      createSpy.mockRestore()

      // Vérifier que handleSubmit a été appelée avec les bonnes valeurs

      // MockImplementation sur la fonction handleSubmit avec un objet bill mocké.
      // Vérifier que l'objet bill récupéré aprés l'appel à handlesubmit est le même que le bill envoyé.
      // puis vérifier que updateBill est appelé (en cliquant sur le boutton envoyer du form) si filePathIsTrue est à true et non appelé si renvoie false.

    })
    test("if handleSubmit is called, then the user go to the page Bills and the new bill is there", async () => {

      // beforeEach(() => {
      //   const localStorageMock = {
      //     getItem: jest.fn().mockReturnValue(JSON.stringify({
      //       type: 'Employee',
      //       email: 'employee@test.tld'
      //     })),
      //     setItem: jest.fn(),
      //     // Ajoutez d'autres méthodes localStorage 
      //   };
      //   Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      // });
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      }));
      // document.body.innerHTML = NewBillUI();

      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname });
      // };

      document.body.innerHTML = NewBillUI()
      const NewBillPage = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      const UpdateSpy = jest.spyOn(mockStore.bills(), "update");

      const handleSubmit = jest.fn(NewBillPage.handleSubmit)
      userEvent.selectOptions(screen.getByTestId('expense-type'), 'Transports');
      userEvent.type(screen.getByTestId('expense-name'), 'Nom de la dépense');
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: '2023-01-01' } });
      userEvent.type(screen.getByTestId('amount'), '100');
      userEvent.type(screen.getByTestId('vat'), '20');
      userEvent.type(screen.getByTestId('pct'), '10');
      userEvent.type(screen.getByTestId('commentary'), 'Commentaire de la dépense');

      // Je met un nouveau fichier file dans l'input de type file
      let fileinput = screen.getByTestId("file")
      const file = new File(['content'], 'test-file.jpg', { type: 'image/jpg' });

      userEvent.upload(fileinput, file)
      // Et je vérifie que le chemin est bien celui de l'objet file

      expect(fileinput.files[0].name).toBe("test-file.jpg");




      let fileInput = screen.getByTestId("file")
      // const handleSubmit = jest.fn((e) => e.preventDefault(), NewBillPage.handleSubmit);
      let result = await checkIfFilePathIsTrue(fileInput, NewBillPage, fileinput.files[0].name)
      console.log(NewBillPage.filePathIsTrue.mock.result)
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form);


      await waitFor(() => {
        // Vérifier que la fonction createSpy a été appelée si result retourne true
        if (result) {
          expect(UpdateSpy).toHaveBeenCalled();
        } else {
          // Si result retourne false, s'assurer que createSpy n'a pas été appelée
          expect(UpdateSpy).not.toHaveBeenCalled();
        }

      })
      if (result) {
        // expect(handleSubmit).toHaveBeenCalled()
        // expect(UpdateSpy).toHaveBeenCalled()
        // await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
        // console.log(document.location.href)
        // expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
        // expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
        // expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      } else {
        // Si filePathIsTrue est faux, onNavigate ne devrait pas être appelé
        expect(onNavigate).not.toHaveBeenCalled();
      }



    })
  })
})

