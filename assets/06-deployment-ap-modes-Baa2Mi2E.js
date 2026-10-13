var e={id:`deployment-ap-modes`,h:{en:`WLAN deployment models and AP modes`,hi:`WLAN deployment models aur AP modes`},body:{en:`
<p>The same AP hardware can be run in very different ways: managed by a controller in the data centre, switching traffic locally at a branch, managed from the cloud, or not serving clients at all but listening for attackers. ENCOR objective 1.2 asks you to compare the <b>deployment models</b>, and 3.3.b asks you to describe the <b>AP modes</b>. They are two views of one design decision, so we cover them together.</p>

<h3>An analogy: running a chain of shops</h3>
<p>A single corner shop needs no head office (<b>autonomous</b>). A chain with fifty shops in one city runs everything from one central warehouse, and every delivery passes through it (<b>centralised</b>). Branches in far-away towns keep stock locally and only phone head office for policy (<b>FlexConnect</b>). A small chain lets its biggest shop act as head office for the others (<b>embedded controller</b>). A franchise runs everything from a web portal (<b>cloud-managed</b>).</p>

<h3>Deployment models</h3>
<table class="cmp"><tr><th>Model</th><th>Where the control plane is</th><th>Where client data goes</th><th>Typical fit</th></tr>
<tr><td><b>Autonomous</b></td><td>On each AP</td><td>Bridged locally by each AP</td><td>A few APs, no controller</td></tr>
<tr><td><b>Centralised (unified / local mode)</b></td><td>Controller in the core or DC (for example a Catalyst 9800-40/-80)</td><td>Tunnelled in CAPWAP to the controller, which bridges it to the WLAN's VLAN</td><td>Campus: seamless roaming, central policy</td></tr>
<tr><td><b>Distributed (FlexConnect)</b></td><td>Central controller across the WAN</td><td>Switched locally at the branch (or centrally per WLAN)</td><td>Branches; keeps working if the WAN fails</td></tr>
<tr><td><b>Embedded / controller-less</b></td><td>Controller software on an AP (Embedded Wireless Controller, formerly Mobility Express) or on a Catalyst 9300 switch</td><td>Local</td><td>Small sites, up to around 100 APs on an AP-hosted controller</td></tr>
<tr><td><b>Cloud-managed</b></td><td>Cloud dashboard (Meraki, or cloud-managed Catalyst)</td><td>Local; only management goes to the cloud</td><td>Many small sites, lean IT teams</td></tr>
<tr><td><b>SD-Access fabric wireless</b></td><td>WLC for control, integrated with the fabric control plane (LISP)</td><td>VXLAN from the AP straight to the fabric edge switch, not to the WLC</td><td>SD-Access campuses (covered in the SD-Access module)</td></tr></table>
<p>The Catalyst 9800 family runs as an appliance, as a virtual machine (<b>9800-CL</b>, in a private or public cloud), embedded on a Catalyst 9300 switch, or on an AP (EWC). The configuration model is the same everywhere: a <b>WLAN profile</b> (SSID and security), a <b>policy profile</b> (VLAN, central or local switching, ACLs, QoS), a <b>policy tag</b> joining WLANs to policies, a <b>site tag</b> (AP join profile, local or FlexConnect site), and an <b>RF tag</b> (RF profiles). Each AP gets one policy tag, one site tag and one RF tag. The lab controller is a 9800-style model with exactly these objects, and chapter 8 builds them from the web UI. Older AireOS controllers had no tags: a WLAN pointed to an interface and the AP mode was a per-AP setting.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Centralised versus FlexConnect traffic">
<rect x="250" y="10" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">WLC (data centre)</text>
<rect x="40" y="120" width="120" height="36" rx="8" fill="#bae6fd"/><text x="100" y="143" text-anchor="middle" class="svg-ink" font-size="13">Campus AP (local)</text>
<rect x="470" y="120" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="540" y="143" text-anchor="middle" class="svg-ink" font-size="13">Branch AP (Flex)</text>
<rect x="470" y="185" width="140" height="34" rx="8" fill="#e2e8f0"/><text x="540" y="207" text-anchor="middle" class="svg-ink" font-size="13">branch switch VLAN</text>
<line x1="100" y1="120" x2="290" y2="50" stroke="#64748b" stroke-width="3"/><text x="150" y="80" class="svg-accent" font-size="12">CAPWAP control + data</text>
<line x1="540" y1="120" x2="360" y2="50" stroke="#64748b" stroke-dasharray="5 4"/><text x="455" y="80" class="svg-accent" font-size="12">control only</text>
<line x1="540" y1="156" x2="540" y2="185" stroke="#64748b" stroke-width="3"/><text x="555" y="175" class="svg-muted" font-size="12">data local</text>
</svg><p class="cap">Local mode tunnels client data to the WLC; a FlexConnect AP can switch it locally at the branch.</p></div>

<h3>AP modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Serves clients?</th><th>What it does</th></tr>
<tr><td><b>Local</b> (default)</td><td>Yes</td><td>Serves clients and tunnels their traffic to the WLC. It briefly leaves its channel now and then to scan others for RRM, rogues and location.</td></tr>
<tr><td><b>FlexConnect</b></td><td>Yes</td><td>For branches: local switching per WLAN, local authentication and survival in <b>standalone</b> mode when the controller is unreachable (existing clients stay connected; new clients can join WLANs with local switching and PSK or local authentication).</td></tr>
<tr><td><b>Monitor</b></td><td>No</td><td>Dedicated sensor: scans all channels for rogues, wireless attacks (wIPS), and improves location accuracy.</td></tr>
<tr><td><b>Sniffer</b></td><td>No</td><td>Captures all frames on one channel and forwards them to a PC running a packet analyser.</td></tr>
<tr><td><b>Rogue detector</b> (legacy, AireOS and older)</td><td>No</td><td>Radios off; listens on the wired side (ARP) to see whether rogue APs' clients appear on your LAN.</td></tr>
<tr><td><b>SE-Connect</b></td><td>No</td><td>Dedicated spectrum analyser for remote tools, finds non-Wi-Fi interference.</td></tr>
<tr><td><b>Bridge / Mesh</b></td><td>Yes (optionally)</td><td>Root APs (wired) and mesh APs (wireless backhaul) build outdoor or point-to-point links; mesh APs can serve clients too.</td></tr>
<tr><td><b>Flex+Bridge</b></td><td>Yes</td><td>Mesh combined with FlexConnect local switching for remote sites.</td></tr></table>

<pre class="code"><span class="c">! Lab 1: AP1 becomes a dedicated sensor (GUI: Configuration &gt; Wireless &gt; Access Points &gt; AP1 &gt; General &gt; AP Mode: Monitor)</span>
WLC1# ap name AP1 mode monitor
WLC1# show ap name AP1 config general</pre>
<pre class="out">CISCO AP Name   : AP1
AP Mode         : <span class="hl">Monitor</span>
Ethernet MAC    : 0050.42a6.9801
IP Address      : 10.10.10.11
Controller      : WLC1
CAPWAP state    : Joined
Policy Tag Name : PT-CAMPUS</pre>
<p>Note that <code>show ap summary</code> on a 9800 has no Mode column; the mode is in <code>show ap name &lt;AP&gt; config general</code>, and in the web UI on the AP's General tab. On a real controller changing the mode makes the AP restart its CAPWAP session. In the lab, LAPTOP1 was on AP1 and immediately roamed to AP2, which you will study in chapter 9. The lab models only local, monitor and sniffer; FlexConnect and bridge are concept-only here and are practised in module wl-flex (FlexConnect and branch design).</p>

<h3>Client density and segmentation (1.2.c, 3.3.f)</h3>
<p><b>Client density</b> is how many clients share each radio. All clients on a channel share its airtime, so a hall of 300 students needs many small cells, not a few loud ones: more APs at lower transmit power, 5 GHz (and 6 GHz where clients support it) on narrow 20 MHz channels, the lowest data rates disabled, and clients steered away from 2.4 GHz. Designs plan tens of clients per radio and fewer when voice or video is involved; the real figure comes from the survey and the applications, not from a fixed number. <b>Segmentation</b> on the 9800 uses <b>groups, profiles and tags</b>: WLAN profiles carry the SSID and security, policy profiles carry VLAN and ACL, and tags attach them to APs. Two floors can share SSIDs and still use different VLANs by using different policy tags.</p>

<div class="eg"><p><b>Worked example: choosing a model.</b> A retail chain has a head office with 300 APs and 120 stores with 2 APs each, connected over the internet with SD-WAN. Head office: centralised, APs in local mode on a 9800 pair in the DC for seamless roaming and central guest policy. Stores: FlexConnect APs managed by the same controllers, WLANs switched locally to the store's VLANs so card terminals keep working if the WAN drops. Two stores that need wIPS coverage get one extra AP in monitor mode.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Leaving APs in monitor or sniffer mode after a project; they look joined and green but serve nobody (the ticket lab has exactly this). (2) Using FlexConnect central switching for heavy traffic over a thin WAN. (3) Trunking all WLAN VLANs to a local-mode AP port; local mode only needs the AP's management VLAN, whereas a FlexConnect AP port with local switching must be a trunk carrying the WLAN VLANs.</p></div>

<div class="exam"><p><b>Exam traps.</b> Monitor, sniffer, rogue detector and SE-Connect serve <b>no</b> clients. FlexConnect is the mode for remote sites that must survive a WAN outage. In SD-Access fabric wireless, data goes from the AP in VXLAN to the fabric edge, while the WLC still handles control. Cloud-managed means management in the cloud, not user traffic.</p></div>

<div class="tip"><p><b>Doing it in the web UI</b></p><p>Lab 1, task 5 (AP mode). Configuration &gt; Wireless &gt; Access Points &gt; AP1 &gt; General: set AP Mode to Monitor and press Update &amp; Apply to Device. Check the result in Monitoring &gt; Wireless &gt; Access Points (AP1 stays Registered) and Monitoring &gt; Wireless &gt; Clients (LAPTOP1 moves to AP2). The page sends <code>ap name AP1 mode monitor</code>. The lab models local, monitor and sniffer only; FlexConnect and bridge are concept only (wl-flex).</p></div>

<div class="scn"><h4>The branch that went silent</h4><p>A bank's branch APs ran in local mode, tunnelling all traffic to the data-centre controller. When the branch's WAN link failed, every wireless teller terminal lost its connection, even though the branch server was in the same building. The team converted the branch APs to FlexConnect with local switching for the teller WLAN and local authentication. At the next outage the APs went into standalone mode and the tellers kept working.</p><p><b>Lesson:</b> pick the deployment model per site. Local mode for campuses, FlexConnect for branches that must survive the WAN.</p></div>

<div class="iv"><p class="q">"When would you use FlexConnect instead of local mode?"</p><p>Strong answer: at remote sites across a WAN, to switch client traffic locally (saving WAN bandwidth and latency) and to keep serving clients in standalone mode if the controller becomes unreachable. Mention the switch port must be a trunk for locally switched VLANs, that central switching can still be used per WLAN (for guests), and that FlexConnect groups share keys for fast roaming and local authentication.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Models: autonomous, centralised, FlexConnect, embedded (EWC), cloud-managed, SD-Access fabric.</li>
<li>9800 model: WLAN profile + policy profile joined by a policy tag; site tag and RF tag per AP.</li>
<li>Client-serving modes: local, FlexConnect, bridge/mesh, Flex+Bridge.</li>
<li>Non-serving modes: monitor, sniffer, rogue detector, SE-Connect.</li>
<li>An AP in the wrong mode looks healthy but serves nobody: always check the Mode column.</li>
</ul></div>
`,hi:`
<p>Same AP hardware ko bilkul alag tareekon se chalaya ja sakta hai: data centre ke controller se managed, branch par traffic locally switch karta hua, cloud se managed, ya clients serve hi na kare balki attackers ko sune. ENCOR objective 1.2 aapse <b>deployment models</b> compare karne ko kehta hai, aur 3.3.b <b>AP modes</b> describe karne ko. Yeh ek hi design decision ke do pehlu hain, isliye hum saath mein padhenge.</p>

<h3>Ek analogy: dukaanon ki chain chalana</h3>
<p>Ek akeli nukkad ki dukaan ko head office nahi chahiye (<b>autonomous</b>). Ek shehar mein pachaas dukaanon wali chain sab kuch ek central warehouse se chalati hai, aur har delivery wahin se guzarti hai (<b>centralised</b>). Door ke shehron ki branches stock locally rakhti hain aur policy ke liye sirf head office ko phone karti hain (<b>FlexConnect</b>). Ek chhoti chain apni sabse badi dukaan ko baaki ka head office bana deti hai (<b>embedded controller</b>). Ek franchise sab kuch web portal se chalati hai (<b>cloud-managed</b>).</p>

<h3>Deployment models</h3>
<table class="cmp"><tr><th>Model</th><th>Control plane kahan hai</th><th>Client data kahan jaata hai</th><th>Kahan fit hai</th></tr>
<tr><td><b>Autonomous</b></td><td>Har AP par</td><td>Har AP locally bridge karta hai</td><td>Kuch APs, controller nahi</td></tr>
<tr><td><b>Centralised (unified / local mode)</b></td><td>Core ya DC mein controller (jaise Catalyst 9800-40/-80)</td><td>CAPWAP mein controller tak tunnel, jo use WLAN ke VLAN par bridge karta hai</td><td>Campus: seamless roaming, central policy</td></tr>
<tr><td><b>Distributed (FlexConnect)</b></td><td>WAN ke paar central controller</td><td>Branch par locally switch (ya har WLAN ke hisaab se centrally)</td><td>Branches; WAN fail ho to bhi chalta rehta hai</td></tr>
<tr><td><b>Embedded / controller-less</b></td><td>AP par controller software (Embedded Wireless Controller, pehle Mobility Express) ya Catalyst 9300 switch par</td><td>Local</td><td>Chhoti sites, AP-hosted controller par lagbhag 100 APs tak</td></tr>
<tr><td><b>Cloud-managed</b></td><td>Cloud dashboard (Meraki, ya cloud-managed Catalyst)</td><td>Local; sirf management cloud jaata hai</td><td>Bahut saari chhoti sites, chhoti IT teams</td></tr>
<tr><td><b>SD-Access fabric wireless</b></td><td>Control ke liye WLC, fabric control plane (LISP) ke saath integrated</td><td>AP se seedha fabric edge switch tak VXLAN, WLC tak nahi</td><td>SD-Access campuses (SD-Access module mein)</td></tr></table>
<p>Catalyst 9800 family appliance ke roop mein, virtual machine (<b>9800-CL</b>, private ya public cloud mein), Catalyst 9300 switch par embedded, ya AP par (EWC) chalti hai. Configuration model har jagah same hai: <b>WLAN profile</b> (SSID aur security), <b>policy profile</b> (VLAN, central ya local switching, ACLs, QoS), <b>policy tag</b> jo WLANs ko policies se jodta hai, <b>site tag</b> (AP join profile, local ya FlexConnect site), aur <b>RF tag</b> (RF profiles). Har AP ko ek policy tag, ek site tag aur ek RF tag milta hai. Lab controller 9800-style model hai jisme bilkul yahi objects hain, aur chapter 8 unhe web UI se banata hai. Purane AireOS controllers mein tags nahi the: WLAN ek interface se jud-ta tha aur AP mode har AP ki setting thi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Centralised vs FlexConnect traffic">
<rect x="250" y="10" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">WLC (data centre)</text>
<rect x="40" y="120" width="120" height="36" rx="8" fill="#bae6fd"/><text x="100" y="143" text-anchor="middle" class="svg-ink" font-size="13">Campus AP (local)</text>
<rect x="470" y="120" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="540" y="143" text-anchor="middle" class="svg-ink" font-size="13">Branch AP (Flex)</text>
<rect x="470" y="185" width="140" height="34" rx="8" fill="#e2e8f0"/><text x="540" y="207" text-anchor="middle" class="svg-ink" font-size="13">branch switch VLAN</text>
<line x1="100" y1="120" x2="290" y2="50" stroke="#64748b" stroke-width="3"/><text x="150" y="80" class="svg-accent" font-size="12">CAPWAP control + data</text>
<line x1="540" y1="120" x2="360" y2="50" stroke="#64748b" stroke-dasharray="5 4"/><text x="455" y="80" class="svg-accent" font-size="12">sirf control</text>
<line x1="540" y1="156" x2="540" y2="185" stroke="#64748b" stroke-width="3"/><text x="555" y="175" class="svg-muted" font-size="12">data local</text>
</svg><p class="cap">Local mode client data WLC tak tunnel karta hai; FlexConnect AP use branch par locally switch kar sakta hai.</p></div>

<h3>AP modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Clients serve karta hai?</th><th>Kya karta hai</th></tr>
<tr><td><b>Local</b> (default)</td><td>Haan</td><td>Clients serve karta hai aur unka traffic WLC tak tunnel karta hai. Beech beech mein thodi der apna channel chhodkar RRM, rogues aur location ke liye doosre channels scan karta hai.</td></tr>
<tr><td><b>FlexConnect</b></td><td>Haan</td><td>Branches ke liye: har WLAN ke hisaab se local switching, local authentication, aur controller unreachable hone par <b>standalone</b> mode mein survive (maujooda clients jude rehte hain; naye clients local switching aur PSK ya local authentication wale WLANs join kar sakte hain).</td></tr>
<tr><td><b>Monitor</b></td><td>Nahi</td><td>Dedicated sensor: rogues, wireless attacks (wIPS) ke liye saare channels scan karta hai, aur location accuracy badhata hai.</td></tr>
<tr><td><b>Sniffer</b></td><td>Nahi</td><td>Ek channel ke saare frames capture karke packet analyser chalane wale PC ko bhejta hai.</td></tr>
<tr><td><b>Rogue detector</b> (legacy, AireOS aur purane)</td><td>Nahi</td><td>Radios off; wired side (ARP) sunta hai ki rogue APs ke clients aapke LAN par dikhte hain ya nahi.</td></tr>
<tr><td><b>SE-Connect</b></td><td>Nahi</td><td>Remote tools ke liye dedicated spectrum analyser, non-Wi-Fi interference dhoondhta hai.</td></tr>
<tr><td><b>Bridge / Mesh</b></td><td>Haan (optional)</td><td>Root APs (wired) aur mesh APs (wireless backhaul) outdoor ya point-to-point links banate hain; mesh APs clients bhi serve kar sakte hain.</td></tr>
<tr><td><b>Flex+Bridge</b></td><td>Haan</td><td>Remote sites ke liye mesh plus FlexConnect local switching.</td></tr></table>

<pre class="code"><span class="c">! Lab 1: AP1 dedicated sensor banta hai (GUI: Configuration &gt; Wireless &gt; Access Points &gt; AP1 &gt; General &gt; AP Mode: Monitor)</span>
WLC1# ap name AP1 mode monitor
WLC1# show ap name AP1 config general</pre>
<pre class="out">CISCO AP Name   : AP1
AP Mode         : <span class="hl">Monitor</span>
Ethernet MAC    : 0050.42a6.9801
IP Address      : 10.10.10.11
Controller      : WLC1
CAPWAP state    : Joined
Policy Tag Name : PT-CAMPUS</pre>
<p>Dhyan do ki 9800 par <code>show ap summary</code> mein Mode column nahi hota; mode <code>show ap name &lt;AP&gt; config general</code> mein hota hai, aur web UI mein AP ke General tab par. Asli controller par mode badalne se AP apna CAPWAP session restart karta hai. Lab mein LAPTOP1 AP1 par tha aur turant AP2 par roam kar gaya, jo aap chapter 9 mein padhoge. Lab sirf local, monitor aur sniffer model karti hai; FlexConnect aur bridge yahan concept-only hain aur module wl-flex (FlexConnect and branch design) mein practise hote hain.</p>

<h3>Client density aur segmentation (1.2.c, 3.3.f)</h3>
<p><b>Client density</b> matlab har radio par kitne clients share karte hain. Ek channel ke saare clients uska airtime share karte hain, isliye 300 students ke hall ko kuch loud cells nahi, bahut saare chhote cells chahiye: zyada APs kam transmit power par, 5 GHz (aur jahan clients support karein 6 GHz) par patle 20 MHz channels, sabse low data rates band, aur clients ko 2.4 GHz se door steer karna. Designs mein har radio par kuch das clients plan hote hain, voice ya video ho to kam; asli figure survey aur applications se aata hai, fixed number se nahi. 9800 par <b>segmentation</b> <b>groups, profiles aur tags</b> se hota hai: WLAN profiles SSID aur security rakhte hain, policy profiles VLAN aur ACL, aur tags unhe APs se jodte hain. Do floors same SSIDs share karke bhi alag policy tags se alag VLANs use kar sakte hain.</p>

<div class="eg"><p><b>Worked example: model chunna.</b> Ek retail chain ka 300 APs wala head office hai aur 2-2 APs wale 120 stores, jo SD-WAN ke saath internet se jude hain. Head office: centralised, DC mein 9800 pair par local mode APs, seamless roaming aur central guest policy ke liye. Stores: usi controllers se managed FlexConnect APs, WLANs store ke VLANs par locally switched taaki WAN girne par bhi card terminals chalte rahein. Do stores jinhe wIPS coverage chahiye, unhe monitor mode mein ek extra AP milta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Project ke baad APs ko monitor ya sniffer mode mein chhod dena; woh joined aur green dikhte hain par kisi ko serve nahi karte (ticket lab mein bilkul yahi hai). (2) Patle WAN par heavy traffic ke liye FlexConnect central switching use karna. (3) Local-mode AP port par saare WLAN VLANs trunk karna; local mode ko sirf AP ka management VLAN chahiye, jabki local switching wale FlexConnect AP ka port WLAN VLANs le jaane wala trunk hona chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> Monitor, sniffer, rogue detector aur SE-Connect <b>koi</b> client serve nahi karte. FlexConnect un remote sites ka mode hai jinhe WAN outage jhelna hai. SD-Access fabric wireless mein data AP se VXLAN mein fabric edge tak jaata hai, jabki WLC ab bhi control sambhalta hai. Cloud-managed ka matlab management cloud mein, user traffic nahi.</p></div>

<div class="tip"><p><b>Web UI mein karna</b></p><p>Lab 1, task 5 (AP mode). Configuration &gt; Wireless &gt; Access Points &gt; AP1 &gt; General: AP Mode Monitor set karo aur Update &amp; Apply to Device dabao. Result Monitoring &gt; Wireless &gt; Access Points (AP1 Registered rehta hai) aur Monitoring &gt; Wireless &gt; Clients (LAPTOP1 AP2 par chala jaata hai) mein check karo. Page <code>ap name AP1 mode monitor</code> bhejta hai. Lab sirf local, monitor aur sniffer model karti hai; FlexConnect aur bridge concept only hain (wl-flex).</p></div>

<div class="scn"><h4>Branch jo chup ho gayi</h4><p>Ek bank ki branch ke APs local mode mein the, saara traffic data-centre controller tak tunnel karte the. Jab branch ka WAN link fail hua, har wireless teller terminal ka connection gaya, jabki branch server usi building mein tha. Team ne branch APs ko teller WLAN ke liye local switching aur local authentication ke saath FlexConnect mein badla. Agle outage par APs standalone mode mein gaye aur tellers kaam karte rahe.</p><p><b>Lesson:</b> har site ke liye deployment model chuno. Campus ke liye local mode, WAN jhelne wali branches ke liye FlexConnect.</p></div>

<div class="iv"><p class="q">"Local mode ki jagah FlexConnect kab use karoge?"</p><p>Strong answer: WAN ke paar remote sites par, client traffic locally switch karne ke liye (WAN bandwidth aur latency bachti hai) aur controller unreachable ho to standalone mode mein clients serve karte rehne ke liye. Batao ki locally switched VLANs ke liye switch port trunk hona chahiye, har WLAN ke liye central switching ab bhi use ho sakti hai (guests ke liye), aur FlexConnect groups fast roaming aur local authentication ke liye keys share karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Models: autonomous, centralised, FlexConnect, embedded (EWC), cloud-managed, SD-Access fabric.</li>
<li>9800 model: WLAN profile + policy profile, policy tag se jude; har AP par site tag aur RF tag.</li>
<li>Client serve karne wale modes: local, FlexConnect, bridge/mesh, Flex+Bridge.</li>
<li>Serve na karne wale modes: monitor, sniffer, rogue detector, SE-Connect.</li>
<li>Galat mode wala AP healthy dikhta hai par kisi ko serve nahi karta: hamesha Mode column check karo.</li>
</ul></div>
`}};export{e as default};