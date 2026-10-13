var e={id:`retiring-a-device`,h:{en:`Retiring a device cleanly`,hi:`Device ko saaf tarike se retire karna`},body:{en:`
<p>Closing a shop has two parts. You remove the shop from the company register, and you also switch off the electricity and lock the door. If you only change the register, the lights still burn and the neighbours still see people walking in. Retiring a FortiGate from a FortiAnalyzer is the same: deleting the entry is the register, stopping the logging is the lock. Do both, in the right order.</p>

<h3>What "delete the device" really does</h3>
<p>On FAZ-1 a registered device is a row in the device table (<code>show dvmdb device</code>). The row holds the serial number, the IP address and the ADOM. Deleting the row does one thing: the FortiAnalyzer no longer knows that serial. It does not reach into the FortiGate and it does not touch the logs already stored. The command in the simulator is <code>diagnose dvm device delete &lt;adom&gt; &lt;device&gt;</code>; in the real product you delete the device in the GUI device manager.</p>
<p>Now the surprise. If the FortiGate is still configured with <code>status enable</code> and the server 192.0.2.6, it keeps sending logs. FAZ-1 sees a connected device with no row, so it is <b>unregistered</b> again. Look at the real output after deleting MDU-FGT while it still logs:</p>
<pre class="out">FAZ-1 # diagnose dvm device delete root MDU-FGT
FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
<span class="hl">MDU-FGT         FGVMEV1JOS6TJ000    192.0.2.12      0               -</span>
FAZ-1 # diagnose device list
Registered devices (1):
NAME            SERIAL              ADOM        IP              CONN  LOGS (traffic/utm/event)  LAST LOG
HQ-FGT          FGVMEV1RGF38I000    root        192.0.2.11      up    3/0/0                     2026-10-12 20:57:58</pre>
<p>The device moved from the registered list to the unregistered list. The counter "LOGS DISCARDED" starts at 0 and grows with every log the FortiGate sends (this is the engine rule: a connected device without a row has all its logs discarded and counted). The real product also keeps such a device in a list until you delete it there; the simulator shows it only while it is connected.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two steps to retire a device">
<rect x="10" y="20" width="190" height="64" rx="8" fill="#ddd6fe"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">Step 1 on FAZ-1</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">delete the device row</text>
<rect x="225" y="20" width="190" height="64" rx="8" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Result</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">listed as unregistered</text>
<rect x="440" y="20" width="190" height="64" rx="8" fill="#bbf7d0"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="13">Step 2 on FortiGate</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">status disable</text>
<line x1="200" y1="52" x2="225" y2="52" stroke="#64748b" stroke-width="2"/><line x1="415" y1="52" x2="440" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="120" width="340" height="52" rx="8" fill="#e2e8f0"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">Stored logs stay and stay searchable</text><text x="320" y="161" text-anchor="middle" class="svg-muted" font-size="12">until retention or quota removes them</text>
</svg><p class="cap">Delete the row, then stop the source. The stored logs are not touched by either step.</p></div>

<h3>Stop the cause</h3>
<p>The cure for the unregistered entry is on the FortiGate, not on FAZ-1. Switch the logging off:</p>
<pre class="code">MDU-FGT # config log fortianalyzer setting
MDU-FGT (setting) # set status disable
MDU-FGT (setting) # end</pre>
<pre class="out">MDU-FGT # diagnose test application miglogd 6
<span class="hl">Log servers: none (FortiAnalyzer logging is disabled).</span>
FAZ-1 # execute fazui unregistered list
There are no unregistered devices.</pre>
<p>Now the unregistered list is empty and the device is gone for good. A FortiGate that is switched off or removed from the network disappears from the list too, because the simulator lists unregistered devices only while they are connected. Never leave a retired unit powered with logging on: it keeps knocking at the door, and if somebody later registers its serial by mistake, a dead store appears in your reports.</p>

<h3>What happens to the stored logs</h3>
<p>Nothing, on purpose. The logs that FAZ-1 stored for MDU-FGT before the removal stay in their ADOM and stay searchable in Log View, until retention or the quota overwrite removes them. The lab proves it:</p>
<pre class="out">FAZ-1 # execute fazui logview root MDU-FGT traffic limit 1
Log View  adom=root device=MDU-FGT type=traffic
<span class="hl">3 logs match, 1 shown (newest first).</span>
1: date=2026-10-12 time=20:57:58 devname="MDU-FGT" devid="FGVMEV1JOS6TJ000" logid="0000000013" type="traffic" ...</pre>
<p>Keep the logs for as long as your compliance rule says (chapter 4 of the ADOM module discusses 30, 90 and 365 days). A store that closed last week can still be asked about by an auditor next year. If the rule says delete earlier, that is a quota and retention decision, not a side effect of removing a device.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri closes Madurai on Friday. Monday: the ticket owner exports the evidence (storage output and the last traffic logs). Wednesday, in the change window: delete MDU-FGT on FAZ-1, confirm it moved to the unregistered list, then disable logging on MDU-FGT and confirm the list is empty. Check that HQ-FGT is still listed as registered with its connection "up". Close the ticket with the before and after outputs attached.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Deleting on FAZ-1 and calling it done while the FortiGate keeps logging. Disabling logging first and forgetting the device row, so the dead device stays in the registered list and in every report. Deleting the wrong device: the command takes the ADOM and the device name, so read the name twice (a wrong name answers "device 'Nope' not found in ADOM 'root'"). Believing that deleting a device deletes its logs.</p></div>

<div class="exam"><p><b>Exam traps.</b> Deleting the entry does not stop the FortiGate. A connected FortiGate with no entry is unregistered. Stored logs survive the deletion. The delete command and the unregistered list are a simulator view of GUI work in the real product.</p></div>

<div class="scn"><h4>The closed store that kept appearing</h4><p>An engineer deleted a closed branch from FAZ-1 and the next morning the device was back in the unregistered list. He deleted it again; it came back. The branch router was still powered in a cupboard with logging enabled. Switching logging off on the FortiGate, as the retirement runbook says, ended it.</p><p><b>Lesson:</b> a device that returns after deletion is a symptom on the FortiGate side, not a FortiAnalyzer bug.</p></div>

<div class="iv"><p class="q">"You deleted a device from the FortiAnalyzer and it shows up again. Why?"</p><p>Because the FortiGate is still configured to log to the FortiAnalyzer. It connects, has no entry, and is listed as unregistered with its logs discarded. Disable the logging on the FortiGate (or remove the server). Add that stored logs are unaffected and remain searchable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Retire in two steps: delete the device entry on FAZ-1, stop the logging on the FortiGate.</li>
<li>Deleting alone makes a still-logging device unregistered; its logs are discarded and counted.</li>
<li>Stored logs are not deleted by removing a device; they follow retention and quota.</li>
<li>Prove it: unregistered list empty, other devices still registered and connected.</li>
</ul></div>
`,hi:`
<p>Shop band karne ke do hisse hote hain. Pehle shop ko company register se hatate ho, aur doosra bijli band karke darwaza lock karte ho. Sirf register badlo to batti jalti rehti hai aur padosi dekhte hain ki log andar ja rahe hain. FortiAnalyzer se FortiGate retire karna bhi yahi hai: entry delete karna register hai, logging band karna lock hai. Dono karo, sahi order mein.</p>

<h3>"Device delete karna" asal mein kya karta hai</h3>
<p>FAZ-1 par registered device device table ki ek row hai (<code>show dvmdb device</code>). Row mein serial number, IP address aur ADOM hota hai. Row delete karne se ek hi cheez hoti hai: FortiAnalyzer ab wo serial nahi jaanta. Wo FortiGate ke andar nahi jaata aur pehle se stored logs ko haath nahi lagata. Simulator mein command <code>diagnose dvm device delete &lt;adom&gt; &lt;device&gt;</code> hai; real product mein aap GUI device manager mein delete karte ho.</p>
<p>Ab surprise. Agar FortiGate abhi bhi <code>status enable</code> aur server 192.0.2.6 ke saath configured hai to wo logs bhejta rehta hai. FAZ-1 ko row ke bina connected device dikhta hai, yaani wo phir se <b>unregistered</b> hai. MDU-FGT ko logging chalte hue delete karne ke baad real output dekho:</p>
<pre class="out">FAZ-1 # diagnose dvm device delete root MDU-FGT
FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
<span class="hl">MDU-FGT         FGVMEV1JOS6TJ000    192.0.2.12      0               -</span>
FAZ-1 # diagnose device list
Registered devices (1):
NAME            SERIAL              ADOM        IP              CONN  LOGS (traffic/utm/event)  LAST LOG
HQ-FGT          FGVMEV1RGF38I000    root        192.0.2.11      up    3/0/0                     2026-10-12 20:57:58</pre>
<p>Device registered list se unregistered list mein chala gaya. "LOGS DISCARDED" counter 0 se shuru hota hai aur FortiGate ke har bheje gaye log ke saath badhta hai (engine rule: row ke bina connected device ke saare logs discard aur count hote hain). Real product bhi aise device ko list mein rakhta hai jab tak aap wahan delete na karo; simulator ise sirf connected hone tak dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Device retire karne ke do steps">
<rect x="10" y="20" width="190" height="64" rx="8" fill="#ddd6fe"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">Step 1 FAZ-1 par</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">device row delete</text>
<rect x="225" y="20" width="190" height="64" rx="8" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Result</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">unregistered dikhta hai</text>
<rect x="440" y="20" width="190" height="64" rx="8" fill="#bbf7d0"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="13">Step 2 FortiGate par</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">status disable</text>
<line x1="200" y1="52" x2="225" y2="52" stroke="#64748b" stroke-width="2"/><line x1="415" y1="52" x2="440" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="120" width="340" height="52" rx="8" fill="#e2e8f0"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">Stored logs rehte hain aur searchable</text><text x="320" y="161" text-anchor="middle" class="svg-muted" font-size="12">jab tak retention ya quota hataye</text>
</svg><p class="cap">Row delete karo, phir source band karo. Dono steps stored logs ko nahi chhuate.</p></div>

<h3>Cause ko roko</h3>
<p>Unregistered entry ka ilaaj FortiGate par hai, FAZ-1 par nahi. Logging band karo:</p>
<pre class="code">MDU-FGT # config log fortianalyzer setting
MDU-FGT (setting) # set status disable
MDU-FGT (setting) # end</pre>
<pre class="out">MDU-FGT # diagnose test application miglogd 6
<span class="hl">Log servers: none (FortiAnalyzer logging is disabled).</span>
FAZ-1 # execute fazui unregistered list
There are no unregistered devices.</pre>
<p>Ab unregistered list khaali hai aur device hamesha ke liye gaya. Jo FortiGate band ya network se hata diya jaye wo bhi list se gayab ho jata hai, kyunki simulator unregistered devices ko sirf connected hone tak list karta hai. Retired unit ko logging on karke powered mat chhodo: wo darwaza khatkhatata rehta hai, aur agar baad mein koi galti se uska serial register kar de to reports mein band store dikhne lagta hai.</p>

<h3>Stored logs ka kya hota hai</h3>
<p>Kuch nahi, jaanboojhkar. MDU-FGT ke jo logs FAZ-1 ne removal se pehle store kiye wo apne ADOM mein rehte hain aur Log View mein searchable rehte hain, jab tak retention ya quota overwrite unhe na hataye. Lab ye prove karta hai:</p>
<pre class="out">FAZ-1 # execute fazui logview root MDU-FGT traffic limit 1
Log View  adom=root device=MDU-FGT type=traffic
<span class="hl">3 logs match, 1 shown (newest first).</span>
1: date=2026-10-12 time=20:57:58 devname="MDU-FGT" devid="FGVMEV1JOS6TJ000" logid="0000000013" type="traffic" ...</pre>
<p>Logs utne time tak rakho jitna aapka compliance rule kehta hai (ADOM module ke chapter 4 mein 30, 90 aur 365 din ki baat hai). Pichhle hafte band hue store ke baare mein auditor agle saal bhi pooch sakta hai. Agar rule jaldi delete karne ko kehta hai to wo quota aur retention ka faisla hai, device hatane ka side effect nahi.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Friday ko Madurai band karta hai. Monday: ticket owner evidence export karta hai (storage output aur aakhri traffic logs). Wednesday, change window mein: FAZ-1 par MDU-FGT delete karo, confirm karo ki wo unregistered list mein gaya, phir MDU-FGT par logging disable karo aur confirm karo ki list khaali hai. Check karo ki HQ-FGT abhi bhi registered hai aur connection "up" hai. Ticket before aur after outputs attach karke close karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> FAZ-1 par delete karke kaam khatam maan lena jabki FortiGate logging kar raha hai. Pehle logging disable karke device row bhool jana, jisse dead device registered list aur har report mein rehta hai. Galat device delete karna: command ADOM aur device name leti hai, naam do baar padho (galat naam par jawab aata hai "device 'Nope' not found in ADOM 'root'"). Ye maan lena ki device delete karne se uske logs bhi delete ho jaate hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Entry delete karne se FortiGate nahi rukta. Entry ke bina connected FortiGate unregistered hai. Stored logs deletion se bach jaate hain. Delete command aur unregistered list real product ke GUI kaam ka simulator view hain.</p></div>

<div class="scn"><h4>Band store jo baar-baar wapas aata raha</h4><p>Ek engineer ne band branch ko FAZ-1 se delete kiya aur agli subah device phir unregistered list mein tha. Usne dobara delete kiya; wo phir aa gaya. Branch ka router almari mein powered tha aur logging enabled thi. Retirement runbook ke hisaab se FortiGate par logging off karne se baat khatam hui.</p><p><b>Lesson:</b> delete ke baad wapas aane wala device FortiGate side ka symptom hai, FortiAnalyzer ka bug nahi.</p></div>

<div class="iv"><p class="q">"Aapne FortiAnalyzer se device delete kiya aur wo phir dikh raha hai. Kyun?"</p><p>Kyunki FortiGate abhi bhi FortiAnalyzer ko log karne ke liye configured hai. Wo connect hota hai, entry nahi hai, aur unregistered ki tarah list hota hai, logs discard hote hain. FortiGate par logging disable karo (ya server hata do). Ye bhi bolo ki stored logs par asar nahi padta aur wo searchable rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Retire do steps mein: FAZ-1 par device entry delete, FortiGate par logging band.</li>
<li>Sirf delete karne se logging karta device unregistered ban jaata hai; uske logs discard aur count hote hain.</li>
<li>Device hatane se stored logs delete nahi hote; wo retention aur quota follow karte hain.</li>
<li>Proof: unregistered list khaali, baaki devices registered aur connected.</li>
</ul></div>
`}};export{e as default};