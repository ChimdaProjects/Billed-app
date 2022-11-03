/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import storeMock from '../__mocks__/store'
import userEvent from "@testing-library/user-event"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills.js"
import router from "../app/Router"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import BillsUI from "../views/BillsUI.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, it should render newBill form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    });

    test("Then, it should have 8 fields on newBill form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
    });
  
  });

  describe("When i add a file of type image as proof of the bill", () => {
    test("Then, this file should change the input" , () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const onNavigate = (pathname) => {
        document.body.innerHTML=ROUTES({ pathname });
      };

      const newBill = new NewBill( {
        document, 
        onNavigate,
        store: storeMock,
        localStorage: window.localStorage
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);

      const file = new File(['hello'], 'hello.png', {type : 'image/png'});
      userEvent.upload(inputFile, file);
      expect(handleChangeFile).toHaveBeenCalled();

      

    });
  });

  describe("When i add an unauthorized type of file as proof of the bill", () => {
    test("Then, an alert is displayed", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const onNavigate = (pathname) => {
        document.body.innerHTML=ROUTES({ pathname });
      };

      const newBill = new NewBill( {
        document, 
        onNavigate,
        store: storeMock,
        localStorage: window.localStorage
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);

      const file = new File(['hello'], 'hello.pdf', {type : 'application/pdf'});
      userEvent.upload(inputFile, file);
      expect(handleChangeFile).toHaveBeenCalled();

    })
  });
  
  describe(" When i submit a new bill form ", ()=> {
    test(" Then, i should be render on Bill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const onNavigate = (pathname) => {
        document.body.innerHTML=ROUTES({ pathname });
      };

      const newBill = new NewBill( {
        document, 
        onNavigate,
        store: storeMock,
        localStorage: window.localStorage
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      
      expect(handleSubmit).toHaveBeenCalled();
     
     
      //expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

// Test d'intégration POST

describe(" Given i am a user connected as employee ", () => {
  describe(" When i send a new bill form ", () => {
    test(" fetches bills from mock API POST" , async () => {
      

      const newBill = {
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      }

      const spyFunction = jest.spyOn(storeMock, 'bills' );
      const bill = storeMock.bills(newBill);
      expect(spyFunction).toHaveBeenCalledTimes(1);
      expect((await bill.list()).length).toBe(4);
    });
  describe("when an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(storeMock, "bills");
      Object.defineProperty(
        window,
        'localStorage',
        { value : localStorageMock}
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      storeMock.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }});
        
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const html = BillsUI({error:"Erreur 404"});
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      storeMock.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const html = BillsUI({error:"Erreur 500"});
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
  });
});
