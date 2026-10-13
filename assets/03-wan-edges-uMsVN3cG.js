var e={id:`wan-edges`,h:{en:`WAN edge platforms, controller mode and Cloud OnRamp`,hi:`WAN edge platforms, controller mode aur Cloud OnRamp`},body:{en:`
<p>The WAN edge is where the overlay meets the real world. It has LAN ports towards users and transport ports towards carriers, and it is the only component that forwards user packets. This chapter explains the two edge families, how to talk to an edge at the command line, how an edge is identified and authorised, and how edges extend to the cloud.</p>

<h3>Two families: cEdge and vEdge</h3>
<table class="cmp"><tr><th></th><th>cEdge (IOS XE)</th><th>vEdge (legacy Viptela OS)</th></tr>
<tr><td>Hardware / virtual</td><td>Catalyst 8000 series (8200, 8300, 8500), Catalyst 8000V, ISR 1000 and 4000, ASR 1000</td><td>vEdge 100, 1000, 2000, 5000 and vEdge Cloud; end of sale, but still in many networks</td></tr>
<tr><td>CLI</td><td>IOS XE in <b>controller mode</b>: normal IOS commands for interfaces, VRFs and routing plus the <code>system</code>, <code>sdwan</code> and <code>omp</code> sections; changes with <code>config-transaction</code> and <code>commit</code></td><td>Viptela CLI: <code>vpn 0</code>, <code>vpn 512</code>, <code>vpn 10</code> blocks and <code>commit</code></td></tr>
<tr><td>Service VPN</td><td>A VRF (<code>vrf definition 10</code>); VPN 0 is the global table; VPN 512 is <code>Mgmt-intf</code></td><td><code>vpn N</code> natively</td></tr>
<tr><td>Features</td><td>Full IOS XE feature set: UTD for IPS and URL filtering, AMP, voice (SRST, CUBE), advanced QoS, NAT, many interface types</td><td>Smaller feature set, no voice, limited embedded security</td></tr></table>
<p>The same Manager, Controller and Validator support both families in one network, which makes migration from vEdge to cEdge possible without a flag day.</p>

<h3>Autonomous mode versus controller mode</h3>
<p>An IOS XE router runs in one of two modes. In <b>autonomous mode</b> it is an ordinary router configured with <code>configure terminal</code>. In <b>controller mode</b> it is managed by the SD-WAN Manager. The mode is changed in exec mode with <code>controller-mode enable</code> or <code>controller-mode disable</code>, and the switch erases the configuration and reloads the device, so it is a deliberate one-time action when onboarding or retiring a router.</p>
<p>In controller mode the router refuses the usual <code>configure terminal</code>. You enter configuration with <code>config-transaction</code>, and the changes take effect only when you type <code>commit</code>:</p>
<pre class="code">E-DEL-1# configure terminal
% This WAN Edge runs in controller mode: use "config-transaction" (changes take effect on "commit").
E-DEL-1# config-transaction
E-DEL-1(config)# ...
E-DEL-1(config)# commit
Commit complete.</pre>
<div class="note"><p>On a router that is managed by templates from the Manager, changes you type on the device can be overwritten the next time the template is pushed. The CLI is mainly for verification and, in the lab, for building a small piece of configuration directly.</p></div>

<h3>How an edge is identified and authorised</h3>
<p>Each edge carries a <b>chassis number</b> and a <b>serial number</b>. For hardware routers these come from the board and its built-in certificate (the secure unique device identifier, SUDI). For virtual routers the Manager issues them together with a one-time token. The Manager keeps a list of the edges that the company allows: the <b>authorised WAN edge list</b>. It sends the list to the Validator and the Controllers. A device that is not on the list fails authentication and cannot join. A device can also be present on the list but set to <i>invalid</i> or <i>staging</i> to prevent or limit its participation; the controller deployment module covers this in detail.</p>
<p>Besides identity, each edge needs three items of configuration so that it can find and prove itself to the controllers. In the lab they look like this:</p>
<pre class="code">system
 system-ip 10.255.0.11
 site-id 100
 organization-name BHARAT-RETAIL
 vbond 198.51.100.30</pre>
<p><code>system-ip</code> and <code>site-id</code> identify the device and its location; <code>organization-name</code> must be spelled exactly like the controllers' value; <code>vbond</code> is the address where the edge starts. Together with a transport interface (chapter 4) these four lines are what a router needs to find its way into the fabric.</p>

<h3>Where edges sit: branch, hub and cloud</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Edge roles">
<rect x="20" y="20" width="180" height="110" rx="12" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Branch edge</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="11">small router, 1 or 2 transports</text><text x="110" y="86" text-anchor="middle" class="svg-muted" font-size="11">local LAN, DIA, voice</text>
<rect x="230" y="20" width="180" height="110" rx="12" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Hub / data-centre edge</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">high-throughput, 2 or more transports</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="11">aggregates branches, shared services</text>
<rect x="440" y="20" width="180" height="110" rx="12" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Cloud edge</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">virtual router in a public cloud</text><text x="530" y="86" text-anchor="middle" class="svg-muted" font-size="11">joins the overlay like any site</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Same software, same control connections, different place and size</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="11">The Manager, Controller and Validator treat all three as WAN edges.</text>
</svg><p class="cap">Edge roles. Whatever its size or location, an edge is identified, authenticated and configured the same way.</p></div>

<h3>Cloud OnRamp: reaching SaaS and public cloud</h3>
<p>The architecture extends to the cloud in three named ways. They are part of the blueprint, so learn the question each one answers:</p>
<table class="cmp"><tr><th>Feature</th><th>Question it answers</th><th>How it works</th></tr>
<tr><td>Cloud OnRamp for SaaS</td><td>Which exit gives this SaaS application the best quality right now?</td><td>Edges probe the application over every possible exit (local internet or a gateway site across the overlay), compute a quality score from loss and latency, and send traffic out of the best exit. It moves when quality degrades.</td></tr>
<tr><td>Cloud OnRamp for IaaS / Multicloud</td><td>How do branches reach workloads in the public cloud with the same VPNs and policy?</td><td>The Manager uses the cloud provider's API to build the transit (for example a transit gateway or virtual WAN hub), deploys Catalyst 8000V edges or integrates the provider's SD-WAN hub, and maps cloud networks to service VPNs. The cloud becomes another site.</td></tr>
<tr><td>Cloud OnRamp for Colocation</td><td>Where do I host shared regional security and routing services?</td><td>Virtualised edges and security functions run in a colocation facility close to the cloud and the branches, forming a regional hub.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bharat Retail adds a Catalyst 8000V in a public cloud so that stores can reach the cloud-based inventory system. The 8000V is onboarded like any edge (system IP 10.255.0.101, site ID 900, same organization name) and advertises the cloud subnet 172.20.0.0/24 in VPN 10. Store edges learn that prefix through the Controller and build tunnels to the cloud edge. No store configuration changes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>configure terminal</code> on a controller-mode router and wondering why it is refused; forgetting <code>commit</code> so the change never applies; mixing up <code>controller-mode enable</code> with a mode that can be toggled casually (it wipes the configuration).</p></div>

<div class="exam"><p><b>Exam trap.</b> The OMP and control-plane behaviour is the same for vEdge and cEdge. Differences are in the CLI and features: IOS XE has the full IOS feature set; vEdge has the Viptela CLI and fewer features.</p></div>

<div class="scn"><h4>The router that would not take a command</h4><p>A contractor tried to add a loopback to a newly installed Catalyst 8200 with <code>configure terminal</code> and was told the device was in controller mode. He assumed the router was broken and requested a replacement. The NOC lead showed him <code>config-transaction</code> and <code>commit</code>; the loopback was added in seconds, and the replacement request was cancelled.</p><p><b>Lesson:</b> controller mode changes how you configure the device, not whether you can.</p></div>

<div class="iv"><p class="q">"What is the difference between a cEdge and a vEdge, and what is controller mode?"</p><p>Strong answer: cEdge is an IOS XE router (Catalyst 8000, ISR, ASR) running SD-WAN software with the full IOS XE feature set; vEdge is the legacy Viptela OS platform. Both join the same overlay. An IOS XE router must be in controller mode to be managed by the SD-WAN Manager; in that mode configuration is done with config-transaction and commit, and switching the mode erases the configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>cEdge runs IOS XE in controller mode; vEdge runs the legacy Viptela OS. Both use the same controllers.</li>
<li>In controller mode use <code>config-transaction</code> and <code>commit</code>; <code>configure terminal</code> is refused.</li>
<li>An edge needs system-ip, site-id, organization-name and vbond, plus a transport interface, to join.</li>
<li>Only edges on the authorised WAN edge list can join; chassis and serial numbers identify them.</li>
<li>Cloud OnRamp for SaaS, IaaS/Multicloud and Colocation extend the fabric to cloud applications and workloads.</li>
</ul></div>
`,hi:`
<p>WAN edge woh jagah hai jahan overlay asli duniya se milta hai. Uske users ki taraf LAN ports hote hain aur carriers ki taraf transport ports, aur yahi akela component hai jo user packets forward karta hai. Yeh chapter do edge families, edge se command line par baat kaise karte hain, edge ki pehchaan aur authorisation kaise hoti hai, aur edges cloud tak kaise extend hote hain yeh samjhata hai.</p>

<h3>Do families: cEdge aur vEdge</h3>
<table class="cmp"><tr><th></th><th>cEdge (IOS XE)</th><th>vEdge (legacy Viptela OS)</th></tr>
<tr><td>Hardware / virtual</td><td>Catalyst 8000 series (8200, 8300, 8500), Catalyst 8000V, ISR 1000 aur 4000, ASR 1000</td><td>vEdge 100, 1000, 2000, 5000 aur vEdge Cloud; end of sale, par kai networks mein abhi bhi</td></tr>
<tr><td>CLI</td><td><b>Controller mode</b> mein IOS XE: interfaces, VRFs aur routing ke liye normal IOS commands plus <code>system</code>, <code>sdwan</code> aur <code>omp</code> sections; changes <code>config-transaction</code> aur <code>commit</code> se</td><td>Viptela CLI: <code>vpn 0</code>, <code>vpn 512</code>, <code>vpn 10</code> blocks aur <code>commit</code></td></tr>
<tr><td>Service VPN</td><td>Ek VRF (<code>vrf definition 10</code>); VPN 0 global table hai; VPN 512 <code>Mgmt-intf</code> hai</td><td>Seedha <code>vpn N</code></td></tr>
<tr><td>Features</td><td>Poora IOS XE feature set: IPS aur URL filtering ke liye UTD, AMP, voice (SRST, CUBE), advanced QoS, NAT, bahut saare interface types</td><td>Chhota feature set, voice nahi, limited embedded security</td></tr></table>
<p>Ek hi network mein wahi Manager, Controller aur Validator dono families ko support karte hain, jisse vEdge se cEdge migration bina flag day ke possible hota hai.</p>

<h3>Autonomous mode versus controller mode</h3>
<p>IOS XE router do modes mein se ek mein chalta hai. <b>Autonomous mode</b> mein woh ek ordinary router hai jo <code>configure terminal</code> se configure hota hai. <b>Controller mode</b> mein woh SD-WAN Manager se managed hota hai. Mode exec mode mein <code>controller-mode enable</code> ya <code>controller-mode disable</code> se badla jaata hai, aur switch karne se configuration erase hoti hai aur device reload hota hai, isliye router onboard ya retire karte waqt yeh ek soch-samajh kar kiya ek-baar ka action hai.</p>
<p>Controller mode mein router aam <code>configure terminal</code> ko refuse karta hai. Aap configuration mein <code>config-transaction</code> se jaate ho, aur changes tabhi lagu hote hain jab aap <code>commit</code> type karte ho:</p>
<pre class="code">E-DEL-1# configure terminal
% This WAN Edge runs in controller mode: use "config-transaction" (changes take effect on "commit").
E-DEL-1# config-transaction
E-DEL-1(config)# ...
E-DEL-1(config)# commit
Commit complete.</pre>
<div class="note"><p>Jo router Manager ke templates se managed hai, us par device par type kiye gaye changes agli baar template push hone par overwrite ho sakte hain. CLI mainly verification ke liye hai aur lab mein seedha chhota configuration banane ke liye.</p></div>

<h3>Edge ki pehchaan aur authorisation kaise hoti hai</h3>
<p>Har edge ke paas ek <b>chassis number</b> aur ek <b>serial number</b> hota hai. Hardware routers ke liye yeh board aur uske built-in certificate (secure unique device identifier, SUDI) se aate hain. Virtual routers ke liye Manager unhe one-time token ke saath issue karta hai. Manager un edges ki list rakhta hai jinhe company allow karti hai: <b>authorised WAN edge list</b>. Woh list Validator aur Controllers ko bhejta hai. Jo device list mein nahi hai woh authentication fail karta hai aur join nahi kar sakta. Device list mein ho kar bhi <i>invalid</i> ya <i>staging</i> set ho sakta hai taaki uski participation roki ya limit ki ja sake; controller deployment module mein yeh detail mein hai.</p>
<p>Identity ke alawa har edge ko configuration ki teen cheezein chahiye taaki woh controllers ko dhundh sake aur apni pehchaan saabit kar sake. Lab mein woh aisi dikhti hain:</p>
<pre class="code">system
 system-ip 10.255.0.11
 site-id 100
 organization-name BHARAT-RETAIL
 vbond 198.51.100.30</pre>
<p><code>system-ip</code> aur <code>site-id</code> device aur uski location ki pehchaan hain; <code>organization-name</code> controllers ki value jaisa bilkul wahi spelling hona chahiye; <code>vbond</code> woh address hai jahan se edge shuru karta hai. Transport interface (chapter 4) ke saath yeh chaar lines hi router ko fabric mein raasta dhundhne ke liye chahiye.</p>

<h3>Edges kahan baithte hain: branch, hub aur cloud</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Edge roles">
<rect x="20" y="20" width="180" height="110" rx="12" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Branch edge</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="11">chhota router, 1 ya 2 transports</text><text x="110" y="86" text-anchor="middle" class="svg-muted" font-size="11">local LAN, DIA, voice</text>
<rect x="230" y="20" width="180" height="110" rx="12" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Hub / data-centre edge</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">high-throughput, 2 ya zyada transports</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="11">branches aggregate, shared services</text>
<rect x="440" y="20" width="180" height="110" rx="12" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Cloud edge</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">public cloud mein virtual router</text><text x="530" y="86" text-anchor="middle" class="svg-muted" font-size="11">kisi bhi site ki tarah overlay join</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Same software, same control connections, alag jagah aur size</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="11">Manager, Controller aur Validator teeno ko WAN edges hi maante hain.</text>
</svg><p class="cap">Edge roles. Size ya location chahe kuch bhi ho, edge ek hi tareeke se identify, authenticate aur configure hota hai.</p></div>

<h3>Cloud OnRamp: SaaS aur public cloud tak pahunchna</h3>
<p>Architecture cloud tak teen naam wale tareekon se extend hota hai. Yeh blueprint ka hissa hain, isliye har ek kis sawaal ka jawab hai yeh seekho:</p>
<table class="cmp"><tr><th>Feature</th><th>Kis sawaal ka jawab</th><th>Kaise kaam karta hai</th></tr>
<tr><td>Cloud OnRamp for SaaS</td><td>Is SaaS application ko abhi kaunsa exit best quality deta hai?</td><td>Edges application ko har possible exit par probe karte hain (local internet ya overlay ke across gateway site), loss aur latency se quality score nikalte hain, aur traffic best exit se bhejte hain. Quality girne par woh shift hota hai.</td></tr>
<tr><td>Cloud OnRamp for IaaS / Multicloud</td><td>Branches public cloud ke workloads tak same VPNs aur policy ke saath kaise pahunchein?</td><td>Manager cloud provider ki API se transit banata hai (jaise transit gateway ya virtual WAN hub), Catalyst 8000V edges deploy karta hai ya provider ke SD-WAN hub se integrate karta hai, aur cloud networks ko service VPNs se map karta hai. Cloud ek aur site ban jaata hai.</td></tr>
<tr><td>Cloud OnRamp for Colocation</td><td>Shared regional security aur routing services kahan host karein?</td><td>Virtualised edges aur security functions colocation facility mein chalte hain jo cloud aur branches ke paas ho, aur regional hub banate hain.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bharat Retail public cloud mein ek Catalyst 8000V jodta hai taaki stores cloud-based inventory system tak pahunch sakein. 8000V kisi bhi edge ki tarah onboard hota hai (system IP 10.255.0.101, site ID 900, wahi organization name) aur VPN 10 mein cloud subnet 172.20.0.0/24 advertise karta hai. Store edges woh prefix Controller se seekhte hain aur cloud edge tak tunnels banate hain. Kisi store ki configuration nahi badalti.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Controller-mode router par <code>configure terminal</code> type karna aur sochna ki woh refuse kyun hua; <code>commit</code> bhool jaana jisse change kabhi apply nahi hota; <code>controller-mode enable</code> ko aisa mode samajhna jo casually toggle kar sakte ho (yeh configuration wipe karta hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> OMP aur control-plane behaviour vEdge aur cEdge ke liye same hai. Farak CLI aur features mein hai: IOS XE ke paas poora IOS feature set hai; vEdge ke paas Viptela CLI aur kam features hain.</p></div>

<div class="scn"><h4>Woh router jo command nahi le raha tha</h4><p>Ek contractor ne naye install hue Catalyst 8200 mein <code>configure terminal</code> se loopback jodne ki koshish ki aur use bataya gaya ki device controller mode mein hai. Usne maan liya ki router kharab hai aur replacement maanga. NOC lead ne use <code>config-transaction</code> aur <code>commit</code> dikhaye; loopback kuch second mein jud gaya, aur replacement request cancel ho gayi.</p><p><b>Seekh:</b> controller mode device ko configure karne ka tareeka badalta hai, yeh nahi ki aap kar sakte ho ya nahi.</p></div>

<div class="iv"><p class="q">"cEdge aur vEdge mein kya farak hai, aur controller mode kya hai?"</p><p>Strong answer: cEdge IOS XE router hai (Catalyst 8000, ISR, ASR) jo SD-WAN software chalata hai poore IOS XE feature set ke saath; vEdge legacy Viptela OS platform hai. Dono same overlay join karte hain. IOS XE router ko SD-WAN Manager se managed hone ke liye controller mode mein hona chahiye; us mode mein configuration config-transaction aur commit se hoti hai, aur mode badalne se configuration erase hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>cEdge controller mode mein IOS XE chalata hai; vEdge legacy Viptela OS. Dono same controllers use karte hain.</li>
<li>Controller mode mein <code>config-transaction</code> aur <code>commit</code> use karo; <code>configure terminal</code> refuse hota hai.</li>
<li>Edge ko join karne ke liye system-ip, site-id, organization-name aur vbond, plus ek transport interface chahiye.</li>
<li>Sirf authorised WAN edge list wale edges join kar sakte hain; chassis aur serial numbers unhe identify karte hain.</li>
<li>Cloud OnRamp for SaaS, IaaS/Multicloud aur Colocation fabric ko cloud applications aur workloads tak extend karte hain.</li>
</ul></div>
`}};export{e as default};