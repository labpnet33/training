var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter gathers the IPsec module into one checklist for the <b>advanced IPsec</b> area of FCSS_SDW_AR-7.6. Remember that every configuration here is a reference that was not run in the simulator. Practise the building blocks in <b>nse4-ipsec</b>, and continue with <b>fsd-advpn</b> for shortcut tunnels.</p>
<h3>Can-do checklist</h3>
<ul><li>Explain why the hub uses a dial-up (dynamic) phase 1 and the spoke a static one with a remote gateway.</li><li>Configure matching IKEv2 phase 1 and phase 2 with sound proposals, PFS and wide selectors.</li><li>Choose DPD, NAT-T and lifetime settings and explain the trade-offs.</li><li>Plan the overlay: one range, pool and network ID per tunnel and per hub; unique names and local IDs.</li><li>Configure mode-config on the hub and the spoke and the tunnel interface address.</li><li>Explain add-route disable and net-device as design choices.</li><li>Build one tunnel per underlay per hub and route each hub address through the right ISP.</li><li>Make the tunnels SD-WAN members of an overlay zone with a health check inside the overlay.</li><li>Name the ADVPN hooks and where they go.</li><li>Verify the four layers and troubleshoot with a filtered IKE debug.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Dial-up phase 1</dt><dd>Type dynamic: accepts any peer that authenticates.</dd><dt>Mode-config</dt><dd>The hub assigns the spoke its tunnel IP during IKE.</dd><dt>Network ID</dt><dd>A number that labels the tunnels of one overlay.</dd><dt>Selector</dt><dd>The source and destination that a phase 2 protects; wide in SD-WAN overlays.</dd><dt>DPD</dt><dd>Dead peer detection for the IKE peer.</dd><dt>NAT-T</dt><dd>Encapsulation of ESP in UDP 4500 when NAT is in the path.</dd><dt>PFS</dt><dd>Perfect forward secrecy: a fresh key exchange for each phase 2 key.</dd><dt>Auto-discovery sender and receiver</dt><dd>The hub and spoke hooks for ADVPN.</dd></dl>
<h3>Most-tested facts</h3>
<ul><li>Hub is dynamic and passive; spoke is static and initiates.</li><li>One tunnel per underlay per hub; each is an SD-WAN member.</li><li>Network ID is equal on the hub and its spokes and different between overlays.</li><li>add-route is disabled when a routing protocol carries the overlay routes.</li><li>The health check must run inside the overlay.</li><li>Tunnel up does not mean healthy overlay: check IKE, tunnel, routing, SD-WAN in order.</li><li>One-way counters point to the return path.</li></ul>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">Reference commands (not run in the simulator)</span>
diagnose vpn ike gateway list
diagnose vpn ike gateway list name &lt;tunnel&gt;
diagnose vpn ike gateway clear name &lt;tunnel&gt;
get vpn ipsec tunnel summary
get vpn ipsec tunnel details
diagnose vpn tunnel list name &lt;tunnel&gt;
diagnose vpn ike log filter dst-addr4 &lt;ip&gt;
diagnose debug application ike -1
diagnose debug enable
diagnose debug disable
diagnose debug reset
get router info bgp summary
diagnose sys sdwan member
diagnose sys sdwan health-check
diagnose sys sdwan service4</pre>
<h3>Where to practise</h3>
<p>The simulator has no overlay labs yet. Repeat the IPsec labs of <b>nse4-ipsec</b> for phase 1 and phase 2 basics, keep a design sheet with one row per tunnel (name, underlay, hub address, range, pool, ID), and review <b>fsd-routing</b> and <b>fsd-fmg</b> for what runs over the tunnels and how they are generated.</p>
<div class="exam"><p><b>Exam trap.</b> If an answer solves a hub with many spokes by writing one phase 1 per spoke, or hides the two ISPs behind one tunnel, it is wrong for this design. If it fixes flapping by making DPD more aggressive, be careful: that usually makes it worse.</p></div>
<div class="scn"><h4>A design review that passed</h4><p>A reviewer asked a team to defend its overlay. They showed the table: four tunnels per branch, one range and pool per tunnel, network IDs 1 and 2, add-route disabled, IKEv2 with certificates, health checks inside the overlay, DPD on-idle with moderate retries, and ADVPN hooks prepared. Then they walked through the four layers of verification on a live branch.</p><p><b>Lesson:</b> A good overlay is a documented plan that every tunnel follows.</p></div>
<div class="iv"><p class="q">"Describe your IPsec overlay design for 200 branches and two hubs."</p><p>Each branch builds one IKEv2 tunnel per ISP to each hub, four in total. Hubs use dial-up phase 1 with mode-config pools, one range and network ID per hub overlay, and add-route disabled so that BGP carries the routes. Tunnels are members of an overlay zone with a health check inside the overlay, DPD is moderate, and certificates identify the branches. The ADVPN hooks are prepared, and templates from FortiManager generate everything from variables.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Dial-up hub, static spokes, IKEv2, mode-config.</li><li>One tunnel per underlay per hub, with a written plan for names, ranges and IDs.</li><li>BGP carries routes; SD-WAN uses the tunnels as members with overlay health checks.</li><li>Verify in four layers and read the first error in a filtered IKE debug.</li></ul></div>
`,hi:`
<p>Yeh chapter IPsec module ko FCSS_SDW_AR-7.6 ke <b>advanced IPsec</b> area ki ek checklist mein samet-ta hai. Yaad rakho ki yahan ki har configuration reference hai jo simulator mein nahi chali. Building blocks <b>nse4-ipsec</b> mein practise karo, aur shortcut tunnels ke liye <b>fsd-advpn</b> par aage badho.</p>
<h3>Can-do checklist</h3>
<ul><li>Samjhao ki hub dial-up (dynamic) phase 1 aur spoke remote gateway wala static phase 1 kyun use karta hai.</li><li>Sound proposals, PFS aur wide selectors ke saath matching IKEv2 phase 1 aur phase 2 configure karo.</li><li>DPD, NAT-T aur lifetime settings chuno aur trade-offs samjhao.</li><li>Overlay plan karo: har tunnel aur har hub ke liye ek range, pool aur network ID; unique names aur local IDs.</li><li>Hub aur spoke par mode-config aur tunnel interface address configure karo.</li><li>add-route disable aur net-device ko design choices ki tarah samjhao.</li><li>Har hub ke liye har underlay par ek tunnel banao aur har hub address ko sahi ISP se route karo.</li><li>Tunnels ko overlay zone ke SD-WAN members banao, overlay ke andar health check ke saath.</li><li>ADVPN hooks ka naam lo aur batao kahan jaate hain.</li><li>Chaar layers verify karo aur filtered IKE debug se troubleshoot karo.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Dial-up phase 1</dt><dd>Type dynamic: har us peer ko accept karta hai jo authenticate ho.</dd><dt>Mode-config</dt><dd>Hub IKE ke dauran spoke ko uska tunnel IP assign karta hai.</dd><dt>Network ID</dt><dd>Ek number jo ek overlay ke tunnels ko label karta hai.</dd><dt>Selector</dt><dd>Source aur destination jo phase 2 protect karta hai; SD-WAN overlays mein wide.</dd><dt>DPD</dt><dd>IKE peer ke liye dead peer detection.</dd><dt>NAT-T</dt><dd>Raaste mein NAT ho to ESP ko UDP 4500 mein encapsulate karna.</dd><dt>PFS</dt><dd>Perfect forward secrecy: har phase 2 key ke liye naya key exchange.</dd><dt>Auto-discovery sender aur receiver</dt><dd>ADVPN ke liye hub aur spoke hooks.</dd></dl>
<h3>Most-tested facts</h3>
<ul><li>Hub dynamic aur passive hai; spoke static hai aur initiate karta hai.</li><li>Har hub ke liye har underlay par ek tunnel; har ek SD-WAN member hai.</li><li>Network ID hub aur uske spokes par barabar aur overlays ke beech alag hai.</li><li>Routing protocol overlay routes le jaaye to add-route disabled hota hai.</li><li>Health check overlay ke andar chalna chahiye.</li><li>Tunnel up matlab healthy overlay nahi: order mein IKE, tunnel, routing, SD-WAN check karo.</li><li>One-way counters return path ki taraf ishara karte hain.</li></ul>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">Reference commands (not run in the simulator)</span>
diagnose vpn ike gateway list
diagnose vpn ike gateway list name &lt;tunnel&gt;
diagnose vpn ike gateway clear name &lt;tunnel&gt;
get vpn ipsec tunnel summary
get vpn ipsec tunnel details
diagnose vpn tunnel list name &lt;tunnel&gt;
diagnose vpn ike log filter dst-addr4 &lt;ip&gt;
diagnose debug application ike -1
diagnose debug enable
diagnose debug disable
diagnose debug reset
get router info bgp summary
diagnose sys sdwan member
diagnose sys sdwan health-check
diagnose sys sdwan service4</pre>
<h3>Kahan practise karein</h3>
<p>Simulator mein abhi overlay labs nahi hain. Phase 1 aur phase 2 basics ke liye <b>nse4-ipsec</b> ke IPsec labs dohrao, har tunnel ke liye ek row wali design sheet rakho (name, underlay, hub address, range, pool, ID), aur tunnels par kya chalta hai aur woh kaise generate hote hain iske liye <b>fsd-routing</b> aur <b>fsd-fmg</b> dekho.</p>
<div class="exam"><p><b>Exam trap.</b> Agar koi jawab bahut spokes wale hub ko har spoke ke liye ek phase 1 likhkar solve karta hai, ya do ISPs ko ek tunnel ke peeche chhupata hai, to woh is design ke liye galat hai. Agar woh DPD ko aur aggressive karke flapping theek karta hai to savdhan raho: yeh aam taur par use aur bura banata hai.</p></div>
<div class="scn"><h4>Design review jo pass hua</h4><p>Ek reviewer ne team se apna overlay defend karne ko kaha. Unhone table dikhayi: har branch ke chaar tunnels, har tunnel ke liye ek range aur pool, network IDs 1 aur 2, add-route disabled, certificates ke saath IKEv2, overlay ke andar health checks, moderate retries ke saath DPD on-idle, aur ADVPN hooks taiyaar. Phir unhone ek live branch par verification ki chaar layers chal kar dikhayi.</p><p><b>Seekh:</b> Accha overlay ek documented plan hai jise har tunnel follow karta hai.</p></div>
<div class="iv"><p class="q">"200 branches aur do hubs ke liye apna IPsec overlay design batao."</p><p>Har branch har hub tak har ISP ke liye ek IKEv2 tunnel banata hai, kul chaar. Hubs mode-config pools ke saath dial-up phase 1 use karte hain, har hub overlay ke liye ek range aur network ID, aur add-route disabled taaki BGP routes le jaaye. Tunnels overlay zone ke members hain, overlay ke andar health check ke saath, DPD moderate hai, aur certificates branches ko pehchante hain. ADVPN hooks taiyaar hain, aur FortiManager ke templates variables se sab kuch generate karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Dial-up hub, static spokes, IKEv2, mode-config.</li><li>Har hub ke liye har underlay par ek tunnel, names, ranges aur IDs ke liye likhe plan ke saath.</li><li>BGP routes le jaata hai; SD-WAN tunnels ko overlay health checks ke saath members ki tarah use karta hai.</li><li>Chaar layers mein verify karo aur filtered IKE debug mein pehla error padho.</li></ul></div>
`}};export{e as default};