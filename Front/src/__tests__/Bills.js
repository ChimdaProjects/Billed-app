/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import storeMock from '../__mocks__/store'
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

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
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When i click on button new bill ", () => {
    test("Then, it should render New bill page", () => {
      Object.defineProperty (
        window, 
        'localStorage',
        {
          value: localStorageMock
        });
      window.localStorage.setItem (
        'user',
        JSON.stringify({
          type:"Employee"
        })
      );
      const html = BillsUI({ data:[] });
      document.body.innerHTML= html;

      const onNavigate = (pathname) => {
        document.body.innerHTML=ROUTES({ pathname });
      };

      const bills = new Bills( {
        document, 
        onNavigate,
        store: storeMock,
        localStorage: window.localStorage
      });

      const handleClickNewBill = jest.fn(bills.handleClickNewBill);
      const newBillBtn = screen.getByTestId("btn-new-bill");

      newBillBtn.addEventListener("click", handleClickNewBill);
      userEvent.click(newBillBtn);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("When i click on eye's icon", () => {
    test("Then, a modal should open", () => {
      Object.defineProperty (
        window, 
        'localStorage',
        {
          value: localStorageMock
        });
      window.localStorage.setItem (
        'user',
        JSON.stringify({
          type:"Employee"
        })
      );

      const html = BillsUI({ data: [bills[0]] });
      document.body.innerHTML = html;
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const billsClass = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });

      const modale = document.getElementById("modaleFile");

      $.fn.modal = jest.fn(() => modale.classList.add("show"));
      const eye = screen.getByTestId("icon-eye");
      const handleClickIconEye = jest.fn(()=> billsClass.handleClickIconEye);
      eye.addEventListener("click", handleClickIconEye)
      userEvent.click(eye);

      expect(handleClickIconEye).toHaveBeenCalled();
  
     expect(modale.classList).toContain("show")

    });
  });

  describe("When i navigate to Bill page", () => {
    test("Then, fetches bills from mock API GET ", async () =>{
      localStorage.setItem(
        "user", 
        JSON.stringify({ 
          type: "Employee", 
      }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const bills = new Bills( {
        document,
        onNavigate,
        store: storeMock,
        localStorage: window.localStorage
      })
      const getBills = jest.fn(bills.getBills);
      const value = await getBills();
      expect(getBills).toHaveBeenCalled();
      expect(value.length).toBe(4);
    })
  })



})
