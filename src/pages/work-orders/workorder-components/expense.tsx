import React, { useState } from "react";
import {
    IonIcon,
    IonLabel,
    IonItem,
    IonButton,
    IonInput,
    IonTextarea,
} from "@ionic/react";
import {
    saveOutline,
} from "ionicons/icons";
import { workOrderExpenseApi } from "../../../api/api";

const WorkOrderExpenses = ({ workOrder, closeModal, onSave }) => {
    const [currentRemarks, setCurrentRemarks] = useState();
    const [currentAmount, setCurrentAmount] = useState();

    const saveWorkOrderExpense = async (workOrder, remarks, amount) => {
        if (workOrder && remarks && amount) {
            try {
                const req = await workOrderExpenseApi.store({
                    amount:amount,
                    remarks: remarks,
                    work_order: workOrder
                });
                console.log("req saveWorkOrderExpense: "+JSON.stringify(req?.data));
                
                if (onSave) {
                    onSave();
                }
                closeModal();
            } catch (error) {
                console.log("saveWorkOrderExpense error: " + JSON.stringify(error.message));
            }
        }
    }
    return (
        <>
            <IonItem>
                <IonLabel><b>Expense</b></IonLabel>
                <IonInput
                    className="ion-text-end"
                    value={currentAmount}
                    onIonInput={(e) => setCurrentAmount(e.target.value)}
                    type="number"
                    placeholder="Enter Amount" />
            </IonItem>
            <IonItem>
                <IonLabel><b>Remarks</b></IonLabel>
                <IonTextarea
                    className="ion-text-end"
                    value={currentRemarks}
                    onIonInput={(e) => setCurrentRemarks(e.target.value)}
                    placeholder="Enter Remarks" />
            </IonItem>
            <IonButton
                expand="block"
                onClick={() => saveWorkOrderExpense(workOrder, currentRemarks, currentAmount)}
            >
                <IonIcon slot="start" icon={saveOutline} /> Save
            </IonButton>
        </>
    )

}
export default WorkOrderExpenses;
