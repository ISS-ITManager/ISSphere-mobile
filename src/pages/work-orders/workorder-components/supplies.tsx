import React, { useState } from "react";
import {
  IonContent,
  IonText,
  IonIcon,
  IonLabel,
  IonList,
  IonItem,
  IonSelect,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonSelectOption,
  IonInput,
} from "@ionic/react";
import {
  filterOutline,
  saveOutline,
} from "ionicons/icons";
import { workOrderSupplyApi } from "../../../api/api";

const WorkOrderSupplies = ({ workOrder, supplierList, categoryList, supplyList , closeModal}) => {

  const [supplyStockList, setSupplyStockList] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState();
  const [selectedSuppCat, setSelectedSuppCat] = useState();
  const [selectedSupply, setSelectedSupply] = useState();
  const [selectedSupplyStock, setSelectedSupplyStock] = useState();

  const [qty, setQty] = useState();

  const applyFilter = async () => {
    console.log("category: " + selectedSuppCat + " |supply: " + selectedSupply + " |supplier: " + selectedSupplier);

    if (selectedSuppCat && selectedSupplier && selectedSupply) {
      try {
        const req = await workOrderSupplyApi.getStock({ supply_category: selectedSuppCat, supply: selectedSupply, supplier: selectedSupplier });
        setSupplyStockList(req.data.data);
        console.log("supplyStock: " + JSON.stringify(req.data.data));

      } catch (error) {

      }
    }
  }

  const saveWorkOrderSupply = () => {
    if (qty && qty > 0 && selectedSupplyStock) {
      try {
        const req = workOrderSupplyApi.store({ quantities: [qty], supply_stocks: [selectedSupplyStock], work_order: workOrder })
        console.log("req: " + JSON.stringify(req));
        closeModal();
      } catch (error) {

      }
    }
  }


  return (
    <IonContent className="ion-padding">
      <IonLabel><h3>Tag Supplier to this Work Order</h3></IonLabel>
      <IonItem>
        <IonLabel>Supplier</IonLabel>
        <IonSelect
          value={selectedSupplier}
          slot="end"
          placeholder="Select Supplier"
          onIonChange={(e) => setSelectedSupplier(e.detail.value)}
        >
          {supplierList?.map((supplier, index) => (
            <IonSelectOption key={index} value={supplier.id}>
              {supplier.company}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      <IonItem>
        <IonLabel>Category</IonLabel>
        <IonSelect
          value={selectedSuppCat}
          slot="end"
          onIonChange={(e) => setSelectedSuppCat(e.detail.value)}
          placeholder="Select Category"
        >
          {categoryList?.map((category, index) => (
            <IonSelectOption key={index} value={category.id}>
              {category.supply_category}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>

      <IonItem>
        <IonLabel>Supply</IonLabel>
        <IonSelect
          value={selectedSupply}
          slot="end"
          onIonChange={(e) => setSelectedSupply(e.detail.value)}
          placeholder="Select Supply"
        >
          {supplyList?.map((supply, index) => (
            <IonSelectOption key={index} value={supply.id}>
              {supply.supply}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>

      <IonButton
        expand="block"
        onClick={() => applyFilter()}
      >
        <IonIcon slot="start" icon={filterOutline} />
        Apply Filters
      </IonButton>

      {supplyStockList.length > 0 &&
        <><br />
          <IonLabel><h3>Add Supply Stock</h3></IonLabel>
          <IonItem>
            <IonLabel>Stock</IonLabel>
            <IonSelect
              placeholder="Select Supply Stock"
              name="supply_stocks"
              onIonChange={(e) => setSelectedSupplyStock(e.detail.value)}
            >
              {supplyStockList.map((stock, index) => (
                <IonSelectOption value={stock.id} key={index}>{stock.batch_number} : {stock.balance} {stock.unit_of_measure}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Quantity</IonLabel>
            <IonInput placeholder="Input Quantity" type="number" slot="end" value={qty} name="quantities" onIonChange={(e) => setQty(e.target.value)} />
          </IonItem>

          <IonButton
            expand="block"
            onClick={saveWorkOrderSupply}
          ><IonIcon slot="start" icon={saveOutline}></IonIcon> Save</IonButton>
        </>}

    </IonContent>
  );
};

export default WorkOrderSupplies;