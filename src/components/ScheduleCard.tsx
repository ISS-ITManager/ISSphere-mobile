import { IonCard, IonCardContent, IonText, IonIcon } from "@ionic/react";
import { location, chevronForward } from "ionicons/icons";
import "../components/ScheduleCard.css";
import BadgeComponent from "../utilities/badgecomponent";
import { formatDateOnly } from "../utilities/globalfns";

const ScheduleCard = ({ style, startTime, endTime, startDate, endDate, refNumber, description, status, group, entity, property, zone, level, room, onClickCard }) => {
    return (
        <IonCard className="schedule-card  animate__animated animate__slideInUp" onClick={onClickCard} style={style}>
            <IonCardContent className="card-content">
                {/* Left Pane - Schedule */}
                <div className="schedule-info">
                    {startTime &&
                        <IonText className="schedule-time">{startTime} - {endTime}
                        </IonText>}
                    {startDate &&
                        <IonText className="schedule-date">
                            {startDate === endDate
                                ? formatDateOnly(startDate)
                                : ` ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`}
                        </IonText>}
                    <div className="status-badge">
                       {status&& <BadgeComponent status={status} />}
                    </div>
                </div>

                {/* Right Pane - Details */}
                <div className="details">
                    {/* <IonText className="ref-number"><b>{refNumber}</b></IonText>
                    <IonText className="description">{description}</IonText> */}                    
                    <IonText className="ref-number"><b>{description}</b></IonText>
                    <IonText className="description">{refNumber}</IonText>
                    <IonText className="location">
                        {group && <IonIcon icon={location} />} {group}
                        {entity && <IonIcon icon={chevronForward} />} {entity}
                        {property && <IonIcon icon={chevronForward} />} {property}
                        {zone && <IonIcon icon={chevronForward} />} {zone}
                        {level && <IonIcon icon={chevronForward} />} {level}
                        {room && <IonIcon icon={chevronForward} />} {room}
                    </IonText>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default ScheduleCard;
