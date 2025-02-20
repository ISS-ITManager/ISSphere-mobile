import React from "react";
import {
  IonContent,
  IonText,
  IonIcon,
  IonLabel,
  IonList,
  IonItem,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
} from "@ionic/react";
import {
  location,
  clipboard,
  documentText,
  calendar,
  person,
  checkmarkCircle,
  locationOutline,
  time,
  closeOutline,
  peopleOutline,
  people,
} from "ionicons/icons";

const WorkOrderDetails = ({ workOrder }: { workOrder: any }) => {
  return (
    <IonList>
      {/* Reference Number */}
      <IonItem
        style={{
          paddingLeft: "0",
          paddingRight: "0",
        }}
      >
        <IonIcon
          slot="start"
          icon={clipboard}
          style={{ color: "var(--ion-color-primary)", fontSize: "30px" }} // Increased icon size
        />
        <IonLabel>
          <h3
            style={{
              fontWeight: "600",
              fontSize: "18px", // Increased font size
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Reference Number
          </h3>
          <p>{workOrder.work_order_request.reference_number}</p>
        </IonLabel>
      </IonItem>

      {/* Description */}
      <IonItem
        style={{
          paddingLeft: "0",
          paddingRight: "0",
        }}
      >
        <IonIcon
          slot="start"
          icon={documentText}
          style={{ color: "var(--ion-color-primary)", fontSize: "30px" }} // Increased icon size
        />
        <IonLabel>
          <h3
            style={{
              fontWeight: "600",
              fontSize: "18px", // Increased font size
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Description
          </h3>
          <p>{workOrder.work_order_request.work_order_description}</p>
        </IonLabel>
      </IonItem>

      {/* Date and Time Requested */}
      <IonItem
        style={{
          paddingLeft: "0",
          paddingRight: "0",
        }}
      >
        <IonIcon
          slot="start"
          icon={calendar}
          style={{ color: "var(--ion-color-primary)", fontSize: "30px" }} // Increased icon size
        />
        <IonLabel>
          <h3
            style={{
              fontWeight: "600",
              fontSize: "18px", // Increased font size
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Date and Time Requested
          </h3>
          <p>
            {new Date(
              workOrder.work_order_request.requested_date
            ).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </IonLabel>
      </IonItem>

      {/* Requested By */}
      <IonItem
        style={{
          paddingLeft: "0",
          paddingRight: "0",
        }}
      >
        <IonIcon
          slot="start"
          icon={person}
          style={{ color: "var(--ion-color-primary)", fontSize: "30px" }} // Increased icon size
        />
        <IonLabel>
          <h3
            style={{
              fontWeight: "600",
              fontSize: "18px", // Increased font size
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Requested By
          </h3>
          <p>
            {workOrder.work_order_request.requested_by.profile.first_name}{" "}
            {workOrder.work_order_request.requested_by.profile.last_name}
          </p>
        </IonLabel>
      </IonItem>

      {/* Accepted By */}
      <IonItem
        style={{
          paddingLeft: "0",
          paddingRight: "0",
        }}
      >
        <IonIcon
          slot="start"
          icon={checkmarkCircle}
          style={{ color: "var(--ion-color-primary)", fontSize: "30px" }} // Increased icon size
        />
        <IonLabel>
          <h3
            style={{
              fontWeight: "600",
              fontSize: "18px", // Increased font size
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Accepted By
          </h3>
          <p>
            {workOrder.work_order_request.accepted_by.profile.first_name}{" "}
            {workOrder.work_order_request.accepted_by.profile.last_name}
          </p>
        </IonLabel>
      </IonItem>

      {/* Location */}
      <IonItem
        style={{
          paddingLeft: "0",
          paddingRight: "0",
        }}
      >
        <IonIcon
          slot="start"
          icon={location}
          style={{ color: "var(--ion-color-primary)", fontSize: "30px" }} // Increased icon size
        />
        <IonLabel>
          <h3
            style={{
              fontWeight: "600",
              fontSize: "18px", // Increased font size
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Location
          </h3>
          <p>
            {workOrder?.location?.group} *
            {workOrder.location.property} * {workOrder.location.zone} * {" "}
            {workOrder.location.level} * {workOrder.location.room}
          </p>
        </IonLabel>
      </IonItem>

      {/* Status */}
      <IonItem
        style={{
          paddingLeft: "0",
          paddingRight: "0",
        }}
      >
        <IonIcon
          slot="start"
          icon={time}
          style={{ color: "var(--ion-color-primary)", fontSize: "30px" }} // Increased icon size
        />
        <IonLabel>
          <h3
            style={{
              fontWeight: "600",
              fontSize: "18px", // Increased font size
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Status
          </h3>
          <p>{workOrder.active_status.status}</p>
        </IonLabel>
      </IonItem>

      {/* Assignees */}
      <IonItem
        style={{
          paddingLeft: "0",
          paddingRight: "0",
        }}
      >
        <IonIcon
          slot="start"
          icon={people}
          style={{ color: "var(--ion-color-primary)", fontSize: "30px" }} // Increased icon size
        />
        <IonLabel>
          <h3
            style={{
              fontWeight: "600",
              fontSize: "18px", // Increased font size
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Assignees
          </h3>
          <IonList>
            {workOrder?.assignees && workOrder?.assignees?.length > 0 &&
            workOrder?.assignees.map((person, index) => (
              <p key={index}>{person.first_name} {person.last_name}</p>
            ))}

            {workOrder?.teams && workOrder?.teams?.length > 0 &&
            workOrder?.teams.map((team, index) => (
              <p key={index}>{team.team}</p>
            ))
            }
          </IonList>
        </IonLabel>
      </IonItem>
    </IonList>
  );
};

export default WorkOrderDetails;
