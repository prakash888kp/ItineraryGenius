// src/components/print-view.tsx
import type { GeneratePersonalizedItineraryOutput, ItineraryDayWithImage } from '@/ai/flows/itinerary-schemas';
import { QRCodeSVG } from 'qrcode.react';

interface PrintViewProps {
  itineraryData: GeneratePersonalizedItineraryOutput;
}

const Icon = ({ path, className }: { path: string; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className || 'icon'}>
      <path d={path} />
    </svg>
);
const ICONS = {
    TRIP: "M12.25 10.75h-.5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5z M14 11.5a.75.75 0 01-.75-.75h-.5a.75.75 0 000 1.5h.5a.75.75 0 01.75-.75zM12 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM4.636 4.636a.75.75 0 00-1.06 1.06l.784.784a.75.75 0 001.06-1.06l-.784-.784zM2.25 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM4.636 19.364a.75.75 0 00-1.06-1.06l-.784.784a.75.75 0 101.06 1.06l.784-.784zM12 21.75a.75.75 0 001.5 0v-1.5a.75.75 0 00-1.5 0v1.5zM19.364 19.364a.75.75 0 001.06-1.06l-.784-.784a.75.75 0 00-1.06 1.06l.784.784zM21.75 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM19.364 4.636a.75.75 0 001.06 1.06l.784-.784a.75.75 0 00-1.06-1.06l-.784-.784zM16 11.5a.75.75 0 01-.75-.75h-.5a.75.75 0 000 1.5h.5A.75.75 0 0116 11.5zM8.75 10.75h-.5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5z",
    BUDGET: "M10.5 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5.25-1.5a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0V6zM12 18a1.5 1.5 0 01-1.5-1.5h-1.5a3 3 0 100-6H12a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5z",
    PRACTICAL: "M3.75 21h16.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v16.5a.75.75 0 00.75.75zm1.5-1.5V15h13.5v4.5H5.25zm0-6V9h13.5v4.5H5.25zm0-6V4.5h13.5v4.5H5.25z",
    DAY: "M6.75 3.75A.75.75 0 006 4.5v15a.75.75 0 001.5 0v-6.323l10.45 3.135A.75.75 0 0018.75 15V5.25a.75.75 0 00-1.25-.663L7.5 7.723V4.5A.75.75 0 006.75 3.75z",
    MORNING: "M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM17.834 17.834a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V18.75a.75.75 0 01.75-.75zM6.166 17.834a.75.75 0 001.06 1.06l1.591-1.59a.75.75 0 10-1.06-1.061l-1.591 1.59zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM6.166 6.166a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 101.061-1.06l-1.59-1.591z",
    AFTERNOON: "M12 3v10.55a2.5 2.5 0 102.5 2.5V3a2.5 2.5 0 10-5 0v12.05a2.5 2.5 0 102.5-2.5V3z",
    EVENING: "M1.5 12.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v5.25a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-5.25zm3-3a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v8.25a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-8.25zm3-3a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v11.25a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V6.75zm3-3a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V3.75z",
    NOTES: "M21.75 6.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z M21.75 12.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z M12.75 6.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z M12.75 12.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z M8.25 6.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z M8.25 12.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z M3.75 21h16.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v16.5a.75.75 0 00.75.75z M5.25 19.5V4.5h13.5v15H5.25z",
    PHOTOS: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l2.909 2.909a.75.75 0 001.06-1.06l-2.909-2.909a3.75 3.75 0 00-5.303 0L2.25 14.69V3.75a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H2.25zm13.5-9a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V6.75z"
};

const DayPartPrint = ({ title, activities, iconPath }: { title: string; activities: ItineraryDayWithImage['morning']['activities']; iconPath: string }) => (
    <div className="print-day-part">
        <h3 className="print-h3"><Icon path={iconPath} className="icon-sm" />{title}</h3>
        <ul>
            {activities.map((act, actIndex) => (
                <li key={`print-${title}-${actIndex}`}>
                    {act.time && <span className="print-activity-time">{act.time}: </span>}<strong>{act.activity}</strong>
                    <p className="print-activity-description">{act.description}</p>
                    {act.location?.address && <p className="print-activity-location">{act.location.address}</p>}
                    {act.estimatedCost !== undefined && <p className="print-activity-cost">Estimated Cost: ${act.estimatedCost.toFixed(2)}</p>}
                </li>
            ))}
        </ul>
    </div>
);


export function PrintView({ itineraryData }: PrintViewProps) {
    const { itinerary, budget, practicalInfo, input } = itineraryData;
    const destination = input.destination || 'your destination';
    const duration = input.duration;
    const travelers = input.travelers;
    const interests = input.interests;

    return (
        <div>
            <h1 className="print-h1">{itineraryData.tripTitle || 'Your Custom Itinerary'}</h1>
            {itineraryData.overview && <p className="print-overview">{itineraryData.overview}</p>}

            <div className="print-section-card">
                <h2 className="print-h2"><Icon path={ICONS.TRIP} />Trip Details</h2>
                <p><strong>Destination:</strong> {destination}</p>
                <p><strong>Duration:</strong> {duration} days</p>
                {travelers !== undefined && <p><strong>Travelers:</strong> {travelers}</p>}
                {interests && <p><strong>Interests:</strong> {interests}</p>}
            </div>

            {budget && (
                <div className="print-section-card page-break-before">
                    <h2 className="print-h2"><Icon path={ICONS.BUDGET} />Estimated Budget</h2>
                    <p><strong>Total for {itinerary.length} days:</strong> ${( (budget.accommodation + budget.food + budget.activities) * itinerary.length ).toFixed(2)}</p>
                    <ul>
                        <li><strong>Accommodation (per day):</strong> ${budget.accommodation.toFixed(2)}</li>
                        <li><strong>Food (per day):</strong> ${budget.food.toFixed(2)}</li>
                        <li><strong>Activities (per day):</strong> ${budget.activities.toFixed(2)}</li>
                    </ul>

                    {(budget.accommodationOptions || budget.activityCosts) && (
                         <div className="print-subsection">
                            <h3 className="print-h3">Detailed Breakdown</h3>
                            {budget.accommodationOptions && budget.accommodationOptions.length > 0 && (
                                 <div className="mb-2">
                                    <h4 className="print-h4">Accommodation Options:</h4>
                                     <ul>
                                        {budget.accommodationOptions.map((option, i) => (
                                            <li key={`print-accom-${i}`}>
                                                <strong>{option.type}:</strong> ${option.costPerNight.toFixed(2)} / night
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {budget.activityCosts && budget.activityCosts.length > 0 && (
                                <div>
                                     <h4 className="print-h4">Specific Activity Costs:</h4>
                                     <ul>
                                        {budget.activityCosts.map((activity, i) => (
                                            <li key={`print-activity-cost-${i}`}>
                                                <strong>{activity.activityName}:</strong> ${activity.estimatedCost.toFixed(2)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                         </div>
                    )}
                </div>
            )}

            {practicalInfo && (
                 <div className="print-section-card page-break-before">
                    <h2 className="print-h2"><Icon path={ICONS.PRACTICAL} />Practical Information</h2>
                    
                    <div className="print-practical-info-section">
                        <h3 className="print-h3">Packing List</h3>
                        <ul>
                            {practicalInfo.packingList.map((item, i) => <li key={`pack-${i}`}>{item}</li>)}
                        </ul>
                    </div>

                    <div className="print-practical-info-section">
                        <h3 className="print-h3">Local Etiquette</h3>
                        <ul>
                            {practicalInfo.localEtiquette.map((tip, i) => <li key={`etiq-${i}`}>{tip}</li>)}
                        </ul>
                    </div>
                    
                    <div className="print-practical-info-section">
                        <h3 className="print-h3">Local Phrases</h3>
                         <ul>
                            {practicalInfo.localPhrases.map((phrase, i) => (
                                <li key={`phrase-${i}`}><strong>{phrase.phrase}:</strong> "{phrase.translation}"</li>
                            ))}
                        </ul>
                    </div>
                    
                    {practicalInfo.currency && (
                        <div className="print-practical-info-section">
                             <h3 className="print-h3">Currency</h3>
                             <p>{practicalInfo.currency}</p>
                         </div>
                    )}

                    <div className="print-practical-info-section">
                        <h3 className="print-h3">Transportation Tips</h3>
                        <ul>
                            {practicalInfo.transportationTips.map((tip, i) => <li key={`trans-${i}`}>{tip}</li>)}
                        </ul>
                    </div>

                     {practicalInfo.visaInfo && (
                         <div className="print-practical-info-section">
                             <h3 className="print-h3">Visa Information</h3>
                             <p>{practicalInfo.visaInfo}</p>
                         </div>
                     )}

                     {practicalInfo.emergencyContacts && Object.keys(practicalInfo.emergencyContacts).length > 0 && (
                         <div className="print-practical-info-section">
                              <h3 className="print-h3">Emergency Contacts</h3>
                              <ul>
                                   {Object.entries(practicalInfo.emergencyContacts).map(([label, contact], i) => (
                                       <li key={`emergency-${i}`}><strong>{label}:</strong> {contact}</li>
                                   ))}
                              </ul>
                          </div>
                     )}

                     {practicalInfo.mapUrl && (
                         <div className="print-practical-info-section print-center">
                              <h3 className="print-h3">Interactive Map</h3>
                              <p>Scan the QR code to view the interactive map:</p>
                              <div className="print-qr-code">
                                  <QRCodeSVG value={practicalInfo.mapUrl} size={128} level="H" includeMargin={true} />
                              </div>
                              <p className="print-map-url"><a href={practicalInfo.mapUrl} target="_blank" rel="noopener noreferrer">{practicalInfo.mapUrl}</a></p>
                         </div>
                     )}
                </div>
            )}

            {itinerary.map((day, index) => (
                <div key={index} className="print-day-section page-break-before">
                    <h2 className="print-h2"><Icon path={ICONS.DAY} />Day {day.day}: {day.title}</h2>
                    
                    {day.imageUrl && (
                         <div className="print-day-image">
                             {/* eslint-disable @next/next/no-img-element */}
                             <img src={day.imageUrl} alt={day.title} />
                             {/* eslint-enable @next/next/no-img-element */}
                         </div>
                    )}

                    <DayPartPrint title={day.morning.title} activities={day.morning.activities} iconPath={ICONS.MORNING} />
                    <DayPartPrint title={day.afternoon.title} activities={day.afternoon.activities} iconPath={ICONS.AFTERNOON} />
                    <DayPartPrint title={day.evening.title} activities={day.evening.activities} iconPath={ICONS.EVENING} />

                    <div className="print-notes-photos-section">
                        <div className="print-notes">
                            <h3 className="print-h3"><Icon path={ICONS.NOTES} className="icon-sm" />My Notes</h3>
                            <div className="print-notes-box">
                                {day.notes || ''}
                            </div>
                        </div>
                        <div className="print-photos">
                            <h3 className="print-h3"><Icon path={ICONS.PHOTOS} className="icon-sm" />Photo Memories</h3>
                            <div className="print-photos-box">
                                Attach a photo here
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
