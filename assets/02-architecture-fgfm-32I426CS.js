var e={id:`architecture-fgfm`,h:{en:`Architecture: three databases and the FGFM tunnel`,hi:`Architecture: teen databases aur FGFM tunnel`},body:{en:`
<p>Picture a library. There is a register of members (who exists), shelves grouped into sections (where books live) and a rule book for lending (what is allowed). A librarian uses all three, but the readers never walk through the register. FortiManager is organised in a similar way, and the readers, which are your users' packets, never pass through it.</p>

<h3>Step 1: the device database</h3>
<p>The <b>device database</b> is the register of managed FortiGates. Each row (an entry in the table) says: device name, serial number, IP address, firmware version, and which ADOM it belongs to. In the simulator you can read it as the table <code>dvmdb device</code> and see it with <code>diagnose dvm device list</code>. A device that is not in this table is not managed, however well it is connected. That is the whole idea behind "unauthorized" devices, coming in chapter 3.</p>

<h3>Step 2: the ADOM database</h3>
<p>The <b>ADOM database</b> lists the administrative domains. An ADOM has a name and a version, such as Kaveri and 7.6. The version matters: a device can only join an ADOM whose version equals the device firmware. ADOMs are switched off by default and only a built-in ADOM called <code>root</code> exists. We turn them on in the first lab with <code>set adom-status enable</code>. The next module goes deeper; here you only need to know that a device must be placed in an ADOM when it is authorized.</p>

<h3>Step 3: the policy database</h3>
<p>The <b>policy database</b> holds what you want the devices to run: address objects, normalized interfaces, policy packages and templates, all inside one ADOM. When you install, FortiManager reads this database, combines it with the device's own settings and sends the result to the FortiGate. The simulator names these tables <code>pm address</code>, <code>pm interface</code>, <code>pm pkg</code> and <code>pm template</code>. These first three labs only use the first two databases and one import into the third.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Three databases inside FortiManager">
<rect x="20" y="20" width="600" height="190" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<text x="40" y="44" class="svg-ink" font-size="13">FMG-1 (FortiManager)</text>
<rect x="40" y="62" width="170" height="70" rx="8" fill="#bae6fd"/><text x="125" y="90" text-anchor="middle" class="svg-ink" font-size="13">Device database</text><text x="125" y="110" text-anchor="middle" class="svg-muted" font-size="12">who is managed</text>
<rect x="235" y="62" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">ADOM database</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">name and version</text>
<rect x="430" y="62" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="515" y="90" text-anchor="middle" class="svg-ink" font-size="13">Policy database</text><text x="515" y="110" text-anchor="middle" class="svg-muted" font-size="12">objects and packages</text>
<rect x="40" y="154" width="560" height="38" rx="8" fill="#fde68a"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">FGFM tunnel, TCP 541, to every managed FortiGate</text>
</svg><p class="cap">Three databases, one management tunnel. User traffic never enters this box.</p></div>

<h3>Step 4: the FGFM tunnel</h3>
<p><b>FGFM</b> is the connection that carries management between FortiManager and a FortiGate. It is a TCP connection to port <b>541</b>. Either side can start it. If the FortiGate starts it, you configure <code>config system central-management</code> on the FortiGate with the FortiManager address; that is chapter 3. If FortiManager starts it, you add the device from the FortiManager and the FortiGate interface must allow the keyword <code>fgfm</code> in its <code>allowaccess</code>; that is chapter 4. Once the tunnel is up, the same tunnel is used to retrieve configuration and to install changes.</p>

<h3>Why this matters</h3>
<p>Knowing which database a fact lives in tells you where to look. "Why is this device not in the list" is a device-database question. "Why is authorize refused" is usually an ADOM question. "Why did install fail" is a policy-database question. And "why does the device show conn down" is an FGFM question. A troubleshooter who sorts a ticket this way saves a lot of time.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FGT (192.0.2.11) connects to FMG-1 (192.0.2.5). FMG-1 sees a new serial number that is not in the device database, so it puts HQ-FGT in a waiting list. You then authorize it into the ADOM Kaveri, and a row appears in the device database with the ADOM set to Kaveri.</p></div>

<pre class="out">FMG-1 # get system status
Platform Type                   : FMG-VM64
Version                         : v7.6.0-build3340 240627 (GA.F)
Hostname                        : FMG-1
Max Number of Admin Domains     : 5
<span class="hl">Admin Domain Configuration      : Disabled</span>
HA Mode                         : Stand Alone

FMG-1 # diagnose dvm adom list
--- There are currently 1 ADOMs ---
OID   STATE    NAME    VERSION  MODE  DEVICES
3     enabled  root    7.6      GMS   0
(ADOMs are disabled: only the root ADOM is in use)</pre>
<p>This is the starting point of every lab: ADOMs disabled, only <code>root</code>. The line to watch is the Admin Domain Configuration line.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking that FortiManager forwards user traffic; mixing up the two directions of FGFM (the FortiGate calling in, or FortiManager calling out); and assuming that a connected device is a managed device. Connected only means the tunnel is up; managed means a row exists in the device database. Also remember that the simulator shows only a few fields; the real product has more databases and a workspace mode that the lab does not model.</p></div>

<div class="exam"><p><b>Exam traps.</b> TCP 541 is FGFM. The device must be in an ADOM whose version equals its firmware. The FortiGate keeps working when FortiManager is unreachable. In the real product there are also separate device-level and ADOM-level revision data; here we describe only what the simulator shows.</p></div>

<div class="scn"><h4>The FortiManager that was blamed for an outage</h4><p>At Kaveri Retail, FMG-1 was rebooted during a patch window and a manager phoned: "Are the branches down?" The engineer checked PC-MDU, which still reached SRV-WEB, and explained that FMG-1 only manages configuration. After the reboot, the device list showed conn down for a few minutes and then up again.</p><p><b>Lesson:</b> the management plane and the traffic plane are separate; a FortiManager restart changes neither policy nor forwarding.</p></div>

<div class="iv"><p class="q">"Is FortiManager in the data path? What does it keep?"</p><p>No. It is a management plane. It keeps a device database, an ADOM database and a policy database, and talks to FortiGates over FGFM on TCP 541. Mention who starts the tunnel and that devices continue to forward without it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiManager holds a device database, an ADOM database and a policy database.</li>
<li>A device must be in the device database, in the right ADOM, to be managed.</li>
<li>FGFM is a TCP 541 tunnel that either side can start.</li>
<li>Connected is not the same as managed.</li>
<li>FortiManager is outside the traffic path.</li>
</ul></div>
`,hi:`
<p>Ek library socho. Ek register hai members ka (kaun exist karta hai), shelves sections mein baanti hui (kitaabein kahan hain) aur ek rule book lending ki (kya allowed hai). Librarian teeno use karta hai, par readers kabhi register ke through nahi chalte. FortiManager bhi isi tarah organised hai, aur readers, yaani aapke users ke packets, kabhi uske through nahi jate.</p>

<h3>Step 1: device database</h3>
<p><b>Device database</b> managed FortiGates ka register hai. Har row (table ki ek entry) batati hai: device name, serial number, IP address, firmware version, aur wo kaun se ADOM ka hai. Simulator mein ise table <code>dvmdb device</code> ki tarah padh sakte ho aur <code>diagnose dvm device list</code> se dekh sakte ho. Jo device is table mein nahi hai wo managed nahi hai, chahe kitna bhi connected ho. "Unauthorized" devices ka poora idea yahi hai, jo chapter 3 mein aayega.</p>

<h3>Step 2: ADOM database</h3>
<p><b>ADOM database</b> administrative domains ki list hai. ADOM ka ek naam aur ek version hota hai, jaise Kaveri aur 7.6. Version zaroori hai: device sirf us ADOM mein ja sakta hai jiska version device firmware ke barabar ho. ADOMs by default off hote hain aur sirf built-in ADOM <code>root</code> hota hai. Pehle lab mein hum <code>set adom-status enable</code> se unhe on karte hain. Agla module aur gehra jata hai; yahan bas itna jaano ki authorize karte waqt device ko ek ADOM mein rakhna padta hai.</p>

<h3>Step 3: policy database</h3>
<p><b>Policy database</b> mein wo hota hai jo aap devices par chalana chahte ho: address objects, normalized interfaces, policy packages aur templates, sab ek ADOM ke andar. Install karte waqt FortiManager ye database padhta hai, device ki apni settings ke saath milata hai aur result FortiGate ko bhejta hai. Simulator in tables ko <code>pm address</code>, <code>pm interface</code>, <code>pm pkg</code> aur <code>pm template</code> naam deta hai. Ye pehle teen labs sirf pehle do databases aur teesre mein ek import use karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="FortiManager ke andar teen databases">
<rect x="20" y="20" width="600" height="190" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<text x="40" y="44" class="svg-ink" font-size="13">FMG-1 (FortiManager)</text>
<rect x="40" y="62" width="170" height="70" rx="8" fill="#bae6fd"/><text x="125" y="90" text-anchor="middle" class="svg-ink" font-size="13">Device database</text><text x="125" y="110" text-anchor="middle" class="svg-muted" font-size="12">kaun managed hai</text>
<rect x="235" y="62" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">ADOM database</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">naam aur version</text>
<rect x="430" y="62" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="515" y="90" text-anchor="middle" class="svg-ink" font-size="13">Policy database</text><text x="515" y="110" text-anchor="middle" class="svg-muted" font-size="12">objects aur packages</text>
<rect x="40" y="154" width="560" height="38" rx="8" fill="#fde68a"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">FGFM tunnel, TCP 541, har managed FortiGate tak</text>
</svg><p class="cap">Teen databases, ek management tunnel. User traffic is box mein kabhi nahi aata.</p></div>

<h3>Step 4: FGFM tunnel</h3>
<p><b>FGFM</b> wo connection hai jo FortiManager aur FortiGate ke beech management carry karta hai. Ye port <b>541</b> par TCP connection hai. Koi bhi side ise start kar sakti hai. FortiGate start kare to FortiGate par <code>config system central-management</code> mein FortiManager ka address set karte ho; ye chapter 3 hai. FortiManager start kare to device FortiManager se add karte ho aur FortiGate interface ke <code>allowaccess</code> mein keyword <code>fgfm</code> hona chahiye; ye chapter 4 hai. Tunnel up hone ke baad wahi tunnel configuration retrieve karne aur changes install karne ke kaam aata hai.</p>

<h3>Yeh kyun zaroori hai</h3>
<p>Kaun si fact kis database mein rehti hai, ye jaanna batata hai kahan dekhna hai. "Ye device list mein kyun nahi hai" device-database ka sawaal hai. "Authorize kyun refuse hua" aksar ADOM ka sawaal hai. "Install kyun fail hua" policy-database ka sawaal hai. Aur "device conn down kyun dikhata hai" FGFM ka sawaal hai. Jo troubleshooter ticket ko aise sort karta hai wo bahut time bachata hai.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FGT (192.0.2.11) FMG-1 (192.0.2.5) se connect hota hai. FMG-1 ko ek naya serial number dikhta hai jo device database mein nahi hai, to wo HQ-FGT ko waiting list mein rakhta hai. Phir aap use ADOM Kaveri mein authorize karte ho, aur device database mein ek row aati hai jisme ADOM Kaveri hai.</p></div>

<pre class="out">FMG-1 # get system status
Platform Type                   : FMG-VM64
Version                         : v7.6.0-build3340 240627 (GA.F)
Hostname                        : FMG-1
Max Number of Admin Domains     : 5
<span class="hl">Admin Domain Configuration      : Disabled</span>
HA Mode                         : Stand Alone

FMG-1 # diagnose dvm adom list
--- There are currently 1 ADOMs ---
OID   STATE    NAME    VERSION  MODE  DEVICES
3     enabled  root    7.6      GMS   0
(ADOMs are disabled: only the root ADOM is in use)</pre>
<p>Har lab ka starting point yahi hai: ADOMs disabled, sirf <code>root</code>. Dekhne wali line Admin Domain Configuration hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Ye sochna ki FortiManager user traffic forward karta hai; FGFM ki do directions mix karna (FortiGate andar call kare ya FortiManager bahar call kare); aur ye maan lena ki connected device managed device hai. Connected ka matlab sirf tunnel up hai; managed ka matlab device database mein row hai. Ye bhi yaad rakho ki simulator sirf kuch fields dikhata hai; real product mein aur databases aur workspace mode hai jo lab model nahi karta.</p></div>

<div class="exam"><p><b>Exam traps.</b> TCP 541 FGFM hai. Device ek aise ADOM mein hona chahiye jiska version uske firmware ke barabar ho. FortiManager unreachable ho to bhi FortiGate kaam karta rehta hai. Real product mein device-level aur ADOM-level revision data alag bhi hota hai; yahan hum sirf wahi batate hain jo simulator dikhata hai.</p></div>

<div class="scn"><h4>Wo FortiManager jise outage ka blame mila</h4><p>Kaveri Retail mein patch window ke dauran FMG-1 reboot hua aur ek manager ne phone kiya: "Kya branches down hain?" Engineer ne PC-MDU check kiya, jo ab bhi SRV-WEB tak pahunch raha tha, aur samjhaya ki FMG-1 sirf configuration manage karta hai. Reboot ke baad device list kuch minute conn down dikhati rahi aur phir wapas up ho gayi.</p><p><b>Lesson:</b> management plane aur traffic plane alag hain; FortiManager restart se na policy badalti hai na forwarding.</p></div>

<div class="iv"><p class="q">"Kya FortiManager data path mein hota hai? Wo kya rakhta hai?"</p><p>Nahi. Wo management plane hai. Wo device database, ADOM database aur policy database rakhta hai, aur FortiGates se FGFM par TCP 541 se baat karta hai. Ye bhi batao ki tunnel kaun start karta hai aur devices uske bina forward karte rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiManager mein device database, ADOM database aur policy database hota hai.</li>
<li>Managed hone ke liye device ko device database mein, sahi ADOM mein hona chahiye.</li>
<li>FGFM TCP 541 tunnel hai jise koi bhi side start kar sakti hai.</li>
<li>Connected aur managed ek cheez nahi hain.</li>
<li>FortiManager traffic path ke bahar hai.</li>
</ul></div>
`}};export{e as default};