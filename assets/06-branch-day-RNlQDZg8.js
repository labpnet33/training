var e={id:`branch-day`,h:{en:`A day in the life of a branch coming online`,hi:`Branch ke online aane ka ek din`},body:{en:`
<p>The best way to see how the four components cooperate is to follow one new branch router from the box to carrying traffic. We will use a retail store in Nagpur as the example. Do not worry about the technical words; each is explained at its first use and collected in the next chapter.</p>

<h3>Before the box ships: the paperwork in the system</h3>
<p>The network team prepares four things in advance:</p>
<ol>
<li><b>The device is known.</b> The router's serial number is on the company's list of authorised WAN edges. The list normally comes from the company's Cisco Smart Account (the Plug and Play, or PnP, portal) and is synchronised into the SD-WAN Manager. A router that is not on the list will be refused.</li>
<li><b>The router is told where to call.</b> In the PnP portal the device is linked to the company's Validator, so a brand-new router can find it.</li>
<li><b>The router has a configuration waiting.</b> In the Manager the router is attached to a <b>template</b> (or configuration group): a prepared description of what a branch router should look like, with a few fill-in values such as the store's IP address and name.</li>
<li><b>The device is assigned to the right customer.</b> Every device carries the company's <b>organization name</b>, a text label that all components must share. It is like the company's name on every ID badge.</li>
</ol>

<h3>On the shop floor: plug in power and a cable</h3>
<p>A store employee unpacks the router, connects one port to the broadband modem, connects the LAN port to the store switch, and powers it on. That is the entire job at the site.</p>

<h3>What the router does by itself</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Seven steps of zero-touch onboarding">
<rect x="10" y="10" width="620" height="34" rx="8" fill="#e2e8f0"/><text x="22" y="32" class="svg-ink" font-size="13">1  Power on: get an IP address from the broadband (DHCP) and a DNS server</text>
<rect x="10" y="50" width="620" height="34" rx="8" fill="#fde68a"/><text x="22" y="72" class="svg-ink" font-size="13">2  Find the Validator address (from the PnP service, or a pre-loaded file)</text>
<rect x="10" y="90" width="620" height="34" rx="8" fill="#fde68a"/><text x="22" y="112" class="svg-ink" font-size="13">3  Prove identity to the Validator: certificate + serial number checked</text>
<rect x="10" y="130" width="620" height="34" rx="8" fill="#bae6fd"/><text x="22" y="152" class="svg-ink" font-size="13">4  Connect to the Manager: download the branch configuration</text>
<rect x="10" y="170" width="620" height="34" rx="8" fill="#ddd6fe"/><text x="22" y="192" class="svg-ink" font-size="13">5  Connect to the Controller: send own routes, receive everyone else's</text>
<rect x="10" y="210" width="620" height="34" rx="8" fill="#bbf7d0"/><text x="22" y="232" class="svg-ink" font-size="13">6  Build IPsec tunnels to other sites and start measuring them (BFD)</text>
<rect x="10" y="250" width="620" height="34" rx="8" fill="#bbf7d0"/><text x="22" y="272" class="svg-ink" font-size="13">7  Policies apply: store traffic flows, voice and card terminals get priority</text>
<text x="320" y="312" text-anchor="middle" class="svg-muted" font-size="12">Typically a few minutes, depending on software download and link speed.</text>
</svg><p class="cap">Zero-touch onboarding of a WAN edge. Colours match the plane: yellow orchestration, blue management, purple control, green data.</p></div>
<p><b>Step 1.</b> The router asks the broadband line for an IP address, using DHCP, and learns a DNS server. Without any address it cannot talk to anyone. Branches with no DHCP service use a small bootstrap file prepared in advance with a fixed address.</p>
<p><b>Step 2.</b> The router must learn where the Validator is. Cisco routers can ask the cloud PnP service, which replies with the Validator address for this company; or the router uses a bootstrap configuration prepared earlier.</p>
<p><b>Step 3.</b> The router opens a secure connection to the Validator and presents its <b>certificate</b>, a digital passport signed by a trusted authority, together with its serial number. The Validator checks that the certificate is genuine, that the organization name matches and that the serial number is on the authorised list. Both sides authenticate each other, so the router also verifies the Validator. If the router is behind a NAT device, the Validator also tells it which public address and port it appears as. Then the Validator hands over the addresses of the Manager and the Controllers.</p>
<p><b>Step 4.</b> The router connects to the Manager, which finds the template attached to this device, fills in the values and sends the finished configuration. The router applies it and may reboot or restart some processes if the software needs to be upgraded first.</p>
<p><b>Step 5.</b> The router connects to the Controller and starts <b>OMP</b> (Overlay Management Protocol). It sends the networks it owns, for example the store LAN 10.40.10.0/24 and the way to reach them (its transport locators), and receives the networks of every other site together with their locators and encryption keys.</p>
<p><b>Steps 6 and 7.</b> Knowing where every other router is, it builds IPsec tunnels and runs <b>BFD</b> inside each one to measure it. When tunnels are up, the central policies apply and user traffic flows.</p>

<div class="eg"><p><b>Worked example.</b> Timeline for the Nagpur store. 10:00 router powered on. 10:01 DHCP address received from broadband. 10:02 Validator contacted and authenticated; Manager and Controller addresses learned. 10:04 configuration downloaded and applied. 10:05 Controller connected and routes exchanged. 10:06 tunnels to the Mumbai data centre and to 20 other stores are up. 10:07 the store's card terminal reaches the payment server. An engineer was never at the site. If the software had needed an upgrade first, add 10 to 20 minutes.</p></div>

<h3>If something goes wrong</h3>
<p>Because the connection to the Validator happens first, most onboarding problems appear there or just after: the router has no address (cable or DHCP), cannot resolve the Validator's name (DNS), is blocked by a firewall, has an incorrect clock (certificates are time-sensitive), has a different organization name, or is missing from the authorised list. Later modules show how to read the error codes, but the pattern to remember now is: each step must succeed before the next one starts, so the first step that fails is where you look.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Forgetting the clock. Certificates are valid between two dates. A router whose clock is wrong may reject a perfectly good certificate. In real deployments NTP (time synchronisation) is part of the checklist for every component.</p></div>

<div class="scn"><h4>The router that would not join</h4><p>A new store router stayed in the "connecting" state for an hour. The store manager had plugged the broadband cable into the LAN port instead of the WAN port, so the router never received an IP address from the modem. The central team saw nothing at all in the Manager because the router had never reached the Validator. A phone call to move the cable fixed it, and the router was online two minutes later.</p><p><b>Lesson:</b> zero-touch is not magic. It depends on basic underlay connectivity (an address, a route, DNS and an open firewall). When a device never shows up in the Manager, suspect the physical or underlay layer first.</p></div>

<div class="iv"><p class="q">"Walk me through how a new WAN edge joins an SD-WAN network."</p><p>Strong answer: the router gets underlay connectivity (DHCP or a bootstrap file), discovers the Validator (via PnP or the bootstrap), authenticates with its certificate and serial against the authorised list, learns the Manager and Controller addresses, connects to the Manager to receive its template configuration, connects to the Controller and joins OMP, then builds IPsec tunnels with BFD to other sites. Mention that the org name and clock must be right.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero-touch needs preparation in the system: authorised serial, Validator link, template and organization name.</li>
<li>The router contacts the Validator first, then the Manager, then the Controller.</li>
<li>Authentication uses certificates and the authorised device list; the clock must be correct.</li>
<li>The Manager sends the configuration; the Controller shares routes and keys through OMP.</li>
<li>Troubleshoot onboarding in order: the first step that fails is where the fault is.</li>
</ul></div>
`,hi:`
<p>Chaaron components kaise milkar kaam karte hain, yeh dekhne ka sabse achha tareeka hai ek naye branch router ko dabbe se traffic le jaane tak follow karna. Hum example ke liye Nagpur ke ek retail store ko lenge. Technical words ki chinta mat karo; har ek ko pehli baar aane par samjhaya gaya hai aur agle chapter mein ek jagah jama hai.</p>

<h3>Dabba ship hone se pehle: system mein paperwork</h3>
<p>Network team pehle se chaar cheezein taiyaar karti hai:</p>
<ol>
<li><b>Device ko system jaanta hai.</b> Router ka serial number company ki authorised WAN edges ki list mein hai. List aam taur par company ke Cisco Smart Account (Plug and Play, ya PnP, portal) se aati hai aur SD-WAN Manager mein synchronise hoti hai. Jo router list mein nahi hai use refuse kar diya jaayega.</li>
<li><b>Router ko bataya gaya hai ki kahan call karna hai.</b> PnP portal mein device company ke Validator se link hota hai, taaki bilkul naya router use dhundh sake.</li>
<li><b>Router ki configuration intezaar kar rahi hai.</b> Manager mein router ek <b>template</b> (ya configuration group) se attach hota hai: branch router kaisa dikhna chahiye iska taiyaar description, kuch bharne wali values ke saath jaise store ka IP address aur naam.</li>
<li><b>Device sahi customer ko assign hai.</b> Har device company ka <b>organization name</b> rakhta hai, ek text label jo saare components ko share karna hota hai. Yeh har ID badge par company ke naam jaisa hai.</li>
</ol>

<h3>Shop floor par: power aur ek cable lagao</h3>
<p>Store ka ek employee router unpack karta hai, ek port ko broadband modem se jodta hai, LAN port ko store switch se jodta hai, aur power on karta hai. Site par bas yahi poora kaam hai.</p>

<h3>Router apne aap kya karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Zero-touch onboarding ke saat steps">
<rect x="10" y="10" width="620" height="34" rx="8" fill="#e2e8f0"/><text x="22" y="32" class="svg-ink" font-size="13">1  Power on: broadband se IP address (DHCP) aur DNS server lo</text>
<rect x="10" y="50" width="620" height="34" rx="8" fill="#fde68a"/><text x="22" y="72" class="svg-ink" font-size="13">2  Validator ka address dhundo (PnP service se, ya pre-loaded file se)</text>
<rect x="10" y="90" width="620" height="34" rx="8" fill="#fde68a"/><text x="22" y="112" class="svg-ink" font-size="13">3  Validator ko identity saabit karo: certificate + serial number check</text>
<rect x="10" y="130" width="620" height="34" rx="8" fill="#bae6fd"/><text x="22" y="152" class="svg-ink" font-size="13">4  Manager se connect: branch configuration download</text>
<rect x="10" y="170" width="620" height="34" rx="8" fill="#ddd6fe"/><text x="22" y="192" class="svg-ink" font-size="13">5  Controller se connect: apne routes bhejo, baakiyon ke lo</text>
<rect x="10" y="210" width="620" height="34" rx="8" fill="#bbf7d0"/><text x="22" y="232" class="svg-ink" font-size="13">6  Doosri sites tak IPsec tunnels banao aur unhe measure karo (BFD)</text>
<rect x="10" y="250" width="620" height="34" rx="8" fill="#bbf7d0"/><text x="22" y="272" class="svg-ink" font-size="13">7  Policies lagu: store traffic chalta hai, voice aur card terminals ko priority</text>
<text x="320" y="312" text-anchor="middle" class="svg-muted" font-size="12">Aam taur par kuch minute, software download aur link speed par depend.</text>
</svg><p class="cap">WAN edge ka zero-touch onboarding. Colours plane se match karte hain: yellow orchestration, blue management, purple control, green data.</p></div>
<p><b>Step 1.</b> Router broadband line se DHCP ke zariye IP address maangta hai aur ek DNS server seekhta hai. Bina address ke woh kisi se baat nahi kar sakta. Jin branches mein DHCP service nahi hoti woh pehle se tayyar ki gayi chhoti bootstrap file use karti hain jisme fixed address hota hai.</p>
<p><b>Step 2.</b> Router ko seekhna hota hai ki Validator kahan hai. Cisco routers cloud PnP service se pooch sakte hain, jo is company ke liye Validator ka address deti hai; ya router pehle se tayyar bootstrap configuration use karta hai.</p>
<p><b>Step 3.</b> Router Validator se ek secure connection kholta hai aur apna <b>certificate</b> dikhata hai, jo ek trusted authority ka sign kiya hua digital passport hai, apne serial number ke saath. Validator check karta hai ki certificate asli hai, organization name match karta hai aur serial number authorised list mein hai. Dono taraf se authentication hota hai, isliye router Validator ko bhi verify karta hai. Agar router NAT device ke peeche hai, to Validator use yeh bhi batata hai ki woh kis public address aur port ke roop mein dikhta hai. Phir Validator Manager aur Controllers ke addresses de deta hai.</p>
<p><b>Step 4.</b> Router Manager se connect hota hai, jo is device se attach template dhundta hai, values bharta hai aur taiyaar configuration bhejta hai. Router use apply karta hai aur agar software pehle upgrade karna ho to reboot ya kuch processes restart kar sakta hai.</p>
<p><b>Step 5.</b> Router Controller se connect hota hai aur <b>OMP</b> (Overlay Management Protocol) shuru karta hai. Woh apne networks bhejta hai, jaise store LAN 10.40.10.0/24, aur unhe pahunchne ka tareeka (uske transport locators), aur har doosri site ke networks unke locators aur encryption keys ke saath leta hai.</p>
<p><b>Steps 6 aur 7.</b> Jab use pata hota hai ki baaki routers kahan hain, to woh IPsec tunnels banata hai aur har ek ke andar use measure karne ke liye <b>BFD</b> chalata hai. Tunnels up hone par central policies lagu hoti hain aur user traffic chalta hai.</p>

<div class="eg"><p><b>Worked example.</b> Nagpur store ki timeline. 10:00 router power on. 10:01 broadband se DHCP address mila. 10:02 Validator se contact aur authentication; Manager aur Controller ke addresses seekhe. 10:04 configuration download aur apply. 10:05 Controller se connect aur routes exchange. 10:06 Mumbai data centre aur 20 aur stores tak tunnels up. 10:07 store ka card terminal payment server tak pahunchta hai. Koi engineer site par kabhi nahi gaya. Agar pehle software upgrade karna padta to 10 se 20 minute aur jodo.</p></div>

<h3>Agar kuch galat ho jaaye</h3>
<p>Kyunki Validator se connection sabse pehle hota hai, zyada tar onboarding problems wahin ya uske turant baad dikhti hain: router ke paas address nahi (cable ya DHCP), Validator ka naam resolve nahi kar paata (DNS), firewall se block hai, clock galat hai (certificates time-sensitive hote hain), organization name alag hai, ya authorised list mein missing hai. Baad ke modules error codes padhna sikhate hain, par abhi yaad rakhne ka pattern yeh hai: har step agle step se pehle succeed hona chahiye, isliye jo pehla step fail ho wahin dekhna hai.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Clock bhool jaana. Certificates do dates ke beech valid hote hain. Galat clock wala router bilkul theek certificate ko bhi reject kar sakta hai. Real deployments mein NTP (time synchronisation) har component ki checklist ka hissa hai.</p></div>

<div class="scn"><h4>Woh router jo join nahi hua</h4><p>Ek naya store router ek ghante tak "connecting" state mein raha. Store manager ne broadband cable WAN port ki jagah LAN port mein laga diya tha, isliye router ko modem se kabhi IP address mila hi nahi. Central team ko Manager mein kuch bhi nahi dikha kyunki router kabhi Validator tak pahuncha hi nahi. Cable badalne ke ek phone call se theek hua, aur router do minute baad online tha.</p><p><b>Seekh:</b> zero-touch jaadu nahi hai. Woh basic underlay connectivity (address, route, DNS aur khula firewall) par depend karta hai. Jab device Manager mein kabhi na dikhe, pehle physical ya underlay layer par shak karo.</p></div>

<div class="iv"><p class="q">"Mujhe samjhao ki naya WAN edge SD-WAN network mein kaise join hota hai."</p><p>Strong answer: router underlay connectivity (DHCP ya bootstrap file) paata hai, Validator discover karta hai (PnP ya bootstrap se), apne certificate aur serial se authorised list ke against authenticate hota hai, Manager aur Controller ke addresses seekhta hai, template configuration lene ke liye Manager se connect hota hai, Controller se connect hokar OMP join karta hai, phir doosri sites tak BFD ke saath IPsec tunnels banata hai. Mention karo ki org name aur clock sahi hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero-touch ko system mein taiyaari chahiye: authorised serial, Validator link, template aur organization name.</li>
<li>Router pehle Validator se, phir Manager se, phir Controller se contact karta hai.</li>
<li>Authentication certificates aur authorised device list se hota hai; clock sahi hona chahiye.</li>
<li>Manager configuration bhejta hai; Controller OMP ke zariye routes aur keys share karta hai.</li>
<li>Onboarding troubleshoot karo order mein: jo pehla step fail ho wahin fault hai.</li>
</ul></div>
`}};export{e as default};