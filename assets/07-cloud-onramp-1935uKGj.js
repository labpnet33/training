var e={id:`cloud-onramp`,h:{en:`Cloud OnRamp for SaaS, IaaS and Multicloud`,hi:`Cloud OnRamp for SaaS, IaaS aur Multicloud`},body:{en:`
<p>DIA answers "may this traffic leave locally?". It does not answer "<b>which</b> exit is best for this application <i>right now</i>?". A branch may have two internet links, a data center with great connectivity, and a cloud security gateway. And applications also live inside public clouds, not only on the internet. <b>Cloud OnRamp</b> is the family of Catalyst SD-WAN features that solve these problems. Learn which member answers which question; this is a favourite exam topic.</p>

<h3>Analogy: an airport with several gates</h3>
<p>Passengers (applications) may leave through gate A (local DIA), gate B (via the Mumbai hub), or gate C (the cloud security gateway). A smart airport measures the queue at every gate and sends each passenger to the quickest one, and re-checks continuously. That is <b>Cloud OnRamp for SaaS</b>. Separately, the airport builds a bridge to a partner terminal in another city (an AWS or Azure network) so passengers can walk straight in. That is <b>Cloud OnRamp for Multicloud</b>.</p>

<table class="cmp"><tr><th>Feature</th><th>Question it answers</th><th>What it does</th></tr>
<tr><td><b>Cloud OnRamp for SaaS</b> (earlier CloudExpress)</td><td>"Which internet exit is best for Microsoft 365 / Webex / Salesforce?"</td><td>Probes each exit, scores quality, steers the app to the best one</td></tr>
<tr><td><b>Cloud OnRamp for Multicloud</b></td><td>"How do branches reach workloads in AWS, Azure or Google Cloud?"</td><td>Automates cloud gateways (virtual WAN Edges) and connects them to the native cloud network</td></tr>
<tr><td><b>Cloud OnRamp for IaaS</b> (older)</td><td>Same, first generation</td><td>Transit VPC or VNet with a pair of virtual edges; replaced by Multicloud</td></tr>
<tr><td><b>Interconnect</b> (Multicloud workflow)</td><td>"Can branches reach the cloud over a private middle mile?"</td><td>Automates gateways at interconnect providers such as Megaport or Equinix</td></tr>
<tr><td><b>Cloud OnRamp for Colocation</b></td><td>"Can I host network and security functions in a regional colo?"</td><td>Deploys virtual network functions on colo hardware, as a regional hub</td></tr></table>

<h3>Cloud OnRamp for SaaS in detail</h3>
<p>You enable it per application (Microsoft 365, Webex, Salesforce, Zoom and others; custom applications with probe endpoints are possible) and per site, from the Cloud OnRamp for SaaS workflow in SD-WAN Manager. The edge then does the following:</p>
<ul>
<li><b>Probing.</b> The WAN Edge sends probes (HTTP or HTTPS requests to the application's endpoints) through <b>every candidate exit</b>: its own DIA interfaces, <b>gateway sites</b> reached over the overlay, and, when configured, SIG tunnels.</li>
<li><b>Scoring.</b> Loss and latency of each exit are combined into a <b>vQoE</b> (quality of experience) indicator. Manager shows it per application and per path as good, needs attention or poor.</li>
<li><b>Best exit.</b> The edge steers that application's traffic to the best exit and re-evaluates continuously. The decision is an automatic data-plane steering; you do not write a policy for each app.</li>
</ul>

<h3>Site roles</h3>
<table class="cmp"><tr><th>Role</th><th>Meaning</th><th>Example</th></tr>
<tr><td><b>DIA site</b></td><td>Has local internet and uses it</td><td>Pune branch with NAT on biz-internet</td></tr>
<tr><td><b>Gateway site</b></td><td>A DC or regional hub with good internet that other sites can use over the overlay</td><td>Mumbai E-DC</td></tr>
<tr><td><b>Client site</b></td><td>No local internet for the app; uses a gateway</td><td>A kiosk reached only through the overlay</td></tr>
<tr><td><b>Hybrid</b></td><td>Local DIA and gateways both candidates; the best wins</td><td>Pune with a backup via Mumbai</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Cloud OnRamp for SaaS choosing among exits">
<rect x="10" y="85" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="65" y="130" text-anchor="middle" class="svg-muted" font-size="12">probes all exits</text>
<rect x="260" y="15" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="37" text-anchor="middle" class="svg-ink" font-size="13">Local DIA (Gi1)</text><text x="345" y="54" text-anchor="middle" class="svg-muted" font-size="12">good</text>
<rect x="260" y="90" width="170" height="50" rx="8" fill="#fde68a"/><text x="345" y="112" text-anchor="middle" class="svg-ink" font-size="13">Gateway site E-DC</text><text x="345" y="129" text-anchor="middle" class="svg-muted" font-size="12">needs attention</text>
<rect x="260" y="165" width="170" height="50" rx="8" fill="#fed7aa"/><text x="345" y="187" text-anchor="middle" class="svg-ink" font-size="13">SIG tunnel</text><text x="345" y="204" text-anchor="middle" class="svg-muted" font-size="12">poor</text>
<rect x="510" y="85" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="13">Microsoft 365</text><text x="570" y="130" text-anchor="middle" class="svg-muted" font-size="12">SaaS front door</text>
<line x1="120" y1="105" x2="260" y2="40" stroke="#64748b" stroke-width="2"/><line x1="120" y1="115" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="120" y1="125" x2="260" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="430" y1="40" x2="510" y2="100" stroke="#16a34a" stroke-width="4"/><text x="490" y="62" text-anchor="middle" class="svg-accent" font-size="11">chosen</text>
</svg><p class="cap">The edge probes every exit for each enabled application and sends the traffic to the one that scores best.</p></div>

<h3>Requirements and good habits</h3>
<ul>
<li><b>NAT DIA must exist</b> on the edge's internet interfaces; Cloud OnRamp chooses among exits, it does not create them. Do this chapter's labs first.</li>
<li><b>Application visibility.</b> Recognising Microsoft 365 and Webex relies on the edge's application-recognition engine (SD-AVC), and for Microsoft 365 the Manager needs access to the vendor's published service address lists.</li>
<li><b>Gateway sites need a good internet path</b> and enough bandwidth for client sites.</li>
<li>Limits exist on the number of applications and application lists per device, so enable only what you need.</li>
</ul>

<h3>Cloud OnRamp for Multicloud in detail</h3>
<p>Cloud OnRamp for IaaS built a transit VPC with a pair of virtual WAN Edges by hand-like automation. It has been replaced by <b>Cloud OnRamp for Multicloud</b>. SD-WAN Manager uses the cloud provider's APIs to deploy <b>Catalyst 8000V cloud gateways</b> and attach them to the cloud's own constructs: AWS Transit Gateway or Cloud WAN, Azure Virtual WAN hubs, and Google Cloud Network Connectivity Center. The typical workflow:</p>
<ol>
<li><b>Cloud global settings and credentials</b>: connect the cloud account securely, choose the software image and instance size.</li>
<li><b>Discover</b> the VPCs or VNets and <b>tag</b> the ones that should join the fabric.</li>
<li><b>Create the cloud gateway</b> (a redundant pair of 8000V edges) in the chosen region.</li>
<li><b>Intent management</b>: map SD-WAN service VPNs to the tagged cloud networks (for example VPN 10 to the production-ERP VPC), so only intended segments connect.</li>
<li><b>Monitor</b> the gateways and connections in Manager.</li>
</ol>
<p>The same Multicloud workflow also automates <b>Interconnect</b> gateways at Megaport or Equinix, so branches reach the cloud over a private, predictable middle mile instead of the public internet.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail runs Microsoft 365 for all staff and its ERP in AWS Mumbai. For Microsoft 365 they enable Cloud OnRamp for SaaS: Pune is a DIA site (probing Gi1 locally and E-DC as a gateway), the Nashik kiosk is a client site that uses E-DC. For the ERP they use Cloud OnRamp for Multicloud: Manager deploys a pair of 8000V gateways in AWS, attaches them to a Transit Gateway, and maps VPN 10 to the VPC tagged <code>env=erp-prod</code>. Pune users reach the ERP through the overlay to the AWS gateway, with no internet exposure.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Treating SaaS and Multicloud as one thing: SaaS chooses an <b>internet exit</b>; Multicloud <b>extends the fabric</b>. (2) Enabling Cloud OnRamp for SaaS on a branch that has no NAT DIA and no gateway. (3) Mapping every VPN to every cloud network, breaking segmentation. (4) Expecting SaaS probing to react to a failed ISP instantly; it is quality-based, and the tracker handles hard failures.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which Cloud OnRamp feature probes Microsoft 365 over local DIA and a gateway site and picks the better one?" is <b>SaaS</b>. "Which one deploys Catalyst 8000V cloud gateways into an AWS Transit Gateway?" is <b>Multicloud</b>. "Transit VPC with a pair of virtual edges" is the older <b>IaaS</b>.</p></div>

<div class="scn"><h4>Meetings freeze every afternoon, but only in Pune</h4><p>Pune users had choppy Webex while Mumbai users were fine. Pune had two internet links; the primary was congested every afternoon. With a static NAT route all internet traffic used the congested link. After enabling Cloud OnRamp for SaaS for Webex with Pune as a hybrid site, Manager showed the local link as poor and the gateway path via E-DC as good during the afternoon peak, and the edge sent Webex via Mumbai only for that period. Complaints stopped without changing the ISP contract.</p><p><b>Lesson:</b> DIA gives the exit; Cloud OnRamp for SaaS picks the best one with measurements.</p></div>

<div class="iv"><p class="q">"Explain Cloud OnRamp for SaaS and for Multicloud, and how they differ."</p><p>SaaS probes each possible internet exit (local DIA, gateway sites, SIG) per application, scores quality (vQoE) from loss and latency, and steers the app to the best exit continuously. Multicloud has SD-WAN Manager use cloud APIs to deploy Catalyst 8000V gateways, attach them to native cloud transit constructs (AWS Transit Gateway or Cloud WAN, Azure Virtual WAN, Google NCC) and map VPNs to cloud networks; it also automates Interconnect with Megaport or Equinix. SaaS chooses an exit; Multicloud extends the fabric.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud OnRamp for SaaS = best internet exit per application, measured by probes (vQoE).</li>
<li>Site roles: DIA, gateway, client, hybrid; NAT DIA must already exist.</li>
<li>Cloud OnRamp for Multicloud = automated cloud gateways (8000V) attached to native cloud constructs, with intent mapping of VPNs to cloud networks.</li>
<li>Cloud OnRamp for IaaS (transit VPC) is the older generation; Interconnect uses Megaport or Equinix.</li>
<li>Different tools for different questions: DIA (may it leave?), SaaS (which exit?), Multicloud (how do I reach the cloud network?).</li>
</ul></div>
`,hi:`
<p>DIA jawab deta hai "kya yeh traffic locally nikal sakta hai?". Yeh jawab nahi deta "<i>abhi</i> is application ke liye <b>kaunsa</b> exit sabse accha hai?". Ek branch ke paas do internet links, ek behtareen connectivity wala data center, aur ek cloud security gateway ho sakte hain. Aur applications sirf internet par nahi, public clouds ke andar bhi hoti hain. <b>Cloud OnRamp</b> Catalyst SD-WAN features ka woh family hai jo in problems ko solve karta hai. Seekho ki kaunsa member kaunsa sawaal solve karta hai; yeh exam ka pasandeeda topic hai.</p>

<h3>Analogy: kai gates wala airport</h3>
<p>Passengers (applications) gate A (local DIA), gate B (Mumbai hub se), ya gate C (cloud security gateway) se nikal sakte hain. Smart airport har gate ki queue measure karta hai aur har passenger ko sabse tez wale gate par bhejta hai, aur lagatar dobara check karta hai. Yeh <b>Cloud OnRamp for SaaS</b> hai. Alag se, airport doosre sheher ke partner terminal (AWS ya Azure network) tak bridge banata hai taaki passengers seedhe andar chal sakein. Yeh <b>Cloud OnRamp for Multicloud</b> hai.</p>

<table class="cmp"><tr><th>Feature</th><th>Kaunsa sawaal solve karta hai</th><th>Kya karta hai</th></tr>
<tr><td><b>Cloud OnRamp for SaaS</b> (pehle CloudExpress)</td><td>"Microsoft 365 / Webex / Salesforce ke liye kaunsa internet exit best hai?"</td><td>Har exit probe karta hai, quality score karta hai, app ko best par steer karta hai</td></tr>
<tr><td><b>Cloud OnRamp for Multicloud</b></td><td>"Branches AWS, Azure ya Google Cloud ke workloads tak kaise pahunchein?"</td><td>Cloud gateways (virtual WAN Edges) automate karta hai aur unhe native cloud network se jodta hai</td></tr>
<tr><td><b>Cloud OnRamp for IaaS</b> (purana)</td><td>Wahi, pehli generation</td><td>Virtual edges ki jodi wala transit VPC ya VNet; Multicloud ne iski jagah li</td></tr>
<tr><td><b>Interconnect</b> (Multicloud workflow)</td><td>"Kya branches private middle mile se cloud tak pahunch sakti hain?"</td><td>Megaport ya Equinix jaise interconnect providers par gateways automate karta hai</td></tr>
<tr><td><b>Cloud OnRamp for Colocation</b></td><td>"Kya main regional colo mein network aur security functions host kar sakta hoon?"</td><td>Colo hardware par virtual network functions deploy karta hai, regional hub ke roop mein</td></tr></table>

<h3>Cloud OnRamp for SaaS detail mein</h3>
<p>Aap ise per application (Microsoft 365, Webex, Salesforce, Zoom aur aur; probe endpoints ke saath custom applications bhi possible) aur per site, SD-WAN Manager ke Cloud OnRamp for SaaS workflow se enable karte ho. Phir edge yeh karta hai:</p>
<ul>
<li><b>Probing.</b> WAN Edge <b>har candidate exit</b> ke through probes (application ke endpoints ko HTTP ya HTTPS requests) bhejta hai: apne DIA interfaces, overlay se pahunche <b>gateway sites</b>, aur configure ho to SIG tunnels.</li>
<li><b>Scoring.</b> Har exit ka loss aur latency mil kar ek <b>vQoE</b> (quality of experience) indicator banta hai. Manager use per application aur per path good, needs attention ya poor ke roop mein dikhata hai.</li>
<li><b>Best exit.</b> Edge us application ka traffic best exit par steer karta hai aur lagatar re-evaluate karta hai. Decision automatic data-plane steering hai; aap har app ke liye policy nahi likhte.</li>
</ul>

<h3>Site roles</h3>
<table class="cmp"><tr><th>Role</th><th>Matlab</th><th>Example</th></tr>
<tr><td><b>DIA site</b></td><td>Local internet hai aur use karta hai</td><td>biz-internet par NAT wali Pune branch</td></tr>
<tr><td><b>Gateway site</b></td><td>Achche internet wala DC ya regional hub jise doosri sites overlay se use kar sakti hain</td><td>Mumbai E-DC</td></tr>
<tr><td><b>Client site</b></td><td>App ke liye local internet nahi; gateway use karta hai</td><td>Sirf overlay se pahunchne wala kiosk</td></tr>
<tr><td><b>Hybrid</b></td><td>Local DIA aur gateways dono candidates; best jeetta hai</td><td>Mumbai se backup wali Pune</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Cloud OnRamp for SaaS exits mein se chunta hai">
<rect x="10" y="85" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="65" y="130" text-anchor="middle" class="svg-muted" font-size="12">sab exits probe</text>
<rect x="260" y="15" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="37" text-anchor="middle" class="svg-ink" font-size="13">Local DIA (Gi1)</text><text x="345" y="54" text-anchor="middle" class="svg-muted" font-size="12">good</text>
<rect x="260" y="90" width="170" height="50" rx="8" fill="#fde68a"/><text x="345" y="112" text-anchor="middle" class="svg-ink" font-size="13">Gateway site E-DC</text><text x="345" y="129" text-anchor="middle" class="svg-muted" font-size="12">needs attention</text>
<rect x="260" y="165" width="170" height="50" rx="8" fill="#fed7aa"/><text x="345" y="187" text-anchor="middle" class="svg-ink" font-size="13">SIG tunnel</text><text x="345" y="204" text-anchor="middle" class="svg-muted" font-size="12">poor</text>
<rect x="510" y="85" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="13">Microsoft 365</text><text x="570" y="130" text-anchor="middle" class="svg-muted" font-size="12">SaaS front door</text>
<line x1="120" y1="105" x2="260" y2="40" stroke="#64748b" stroke-width="2"/><line x1="120" y1="115" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="120" y1="125" x2="260" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="430" y1="40" x2="510" y2="100" stroke="#16a34a" stroke-width="4"/><text x="490" y="62" text-anchor="middle" class="svg-accent" font-size="11">chosen</text>
</svg><p class="cap">Edge har enabled application ke liye har exit probe karta hai aur traffic ko best score wale par bhejta hai.</p></div>

<h3>Requirements aur achchi aadatein</h3>
<ul>
<li>Edge ke internet interfaces par <b>NAT DIA maujood hona chahiye</b>; Cloud OnRamp exits ke beech chunta hai, banata nahi. Pehle is module ki labs karo.</li>
<li><b>Application visibility.</b> Microsoft 365 aur Webex pehchanna edge ke application-recognition engine (SD-AVC) par depend karta hai, aur Microsoft 365 ke liye Manager ko vendor ki published service address lists tak access chahiye.</li>
<li><b>Gateway sites ko achcha internet path chahiye</b> aur client sites ke liye kaafi bandwidth.</li>
<li>Per device applications aur application lists ki ginti par limits hain, isliye sirf jo chahiye wahi enable karo.</li>
</ul>

<h3>Cloud OnRamp for Multicloud detail mein</h3>
<p>Cloud OnRamp for IaaS ek pair virtual WAN Edges wala transit VPC banata tha. Uski jagah <b>Cloud OnRamp for Multicloud</b> ne li hai. SD-WAN Manager cloud provider ke APIs se <b>Catalyst 8000V cloud gateways</b> deploy karta hai aur unhe cloud ke apne constructs se jodta hai: AWS Transit Gateway ya Cloud WAN, Azure Virtual WAN hubs, aur Google Cloud Network Connectivity Center. Typical workflow:</p>
<ol>
<li><b>Cloud global settings aur credentials</b>: cloud account securely connect karo, software image aur instance size chuno.</li>
<li>VPCs ya VNets <b>discover</b> karo aur jo fabric mein judne chahiye unhe <b>tag</b> karo.</li>
<li>Chune hue region mein <b>cloud gateway banao</b> (8000V edges ki redundant jodi).</li>
<li><b>Intent management</b>: SD-WAN service VPNs ko tagged cloud networks se map karo (jaise VPN 10 ko production-ERP VPC se), taaki sirf intended segments connect hon.</li>
<li>Manager mein gateways aur connections <b>monitor</b> karo.</li>
</ol>
<p>Wahi Multicloud workflow Megaport ya Equinix par <b>Interconnect</b> gateways bhi automate karta hai, taaki branches public internet ki jagah private, predictable middle mile se cloud tak pahunchein.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail saare staff ke liye Microsoft 365 aur ERP AWS Mumbai mein chalata hai. Microsoft 365 ke liye woh Cloud OnRamp for SaaS enable karte hain: Pune DIA site hai (Gi1 ko locally aur E-DC ko gateway ke roop mein probe karta hai), Nashik kiosk client site hai jo E-DC use karta hai. ERP ke liye woh Cloud OnRamp for Multicloud use karte hain: Manager AWS mein 8000V gateways ki jodi deploy karta hai, use Transit Gateway se jodta hai, aur VPN 10 ko <code>env=erp-prod</code> tag wale VPC se map karta hai. Pune users ERP tak overlay se AWS gateway ke through pahunchte hain, internet exposure ke bina.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) SaaS aur Multicloud ko ek cheez samajhna: SaaS <b>internet exit</b> chunta hai; Multicloud <b>fabric ko extend</b> karta hai. (2) Aisi branch par Cloud OnRamp for SaaS enable karna jisme NAT DIA aur gateway dono nahi. (3) Har VPN ko har cloud network se map karna, jo segmentation tod deta hai. (4) SaaS probing se failed ISP par turant react hone ki ummeed rakhna; woh quality-based hai, aur hard failures tracker handle karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa Cloud OnRamp feature Microsoft 365 ko local DIA aur gateway site se probe karke behtar chunta hai?" <b>SaaS</b>. "Kaunsa Catalyst 8000V cloud gateways AWS Transit Gateway mein deploy karta hai?" <b>Multicloud</b>. "Virtual edges ki jodi wala transit VPC" purana <b>IaaS</b> hai.</p></div>

<div class="scn"><h4>Meetings roz dopahar freeze hoti hain, lekin sirf Pune mein</h4><p>Pune users ka Webex choppy tha jabki Mumbai users theek the. Pune ke paas do internet links the; primary roz dopahar congested rehta tha. Static NAT route ke saath saara internet traffic congested link use karta tha. Webex ke liye Pune ko hybrid site banakar Cloud OnRamp for SaaS enable karne ke baad Manager ne local link ko poor aur E-DC ke through gateway path ko good dikhaya dopahar ke peak mein, aur edge ne sirf us period ke liye Webex ko Mumbai ke through bheja. ISP contract badle bina complaints band ho gayi.</p><p><b>Lesson:</b> DIA exit deta hai; Cloud OnRamp for SaaS measurements se best exit chunta hai.</p></div>

<div class="iv"><p class="q">"Cloud OnRamp for SaaS aur Multicloud samjhao, aur woh kaise alag hain."</p><p>SaaS har possible internet exit (local DIA, gateway sites, SIG) ko per application probe karta hai, loss aur latency se quality (vQoE) score karta hai, aur app ko lagatar best exit par steer karta hai. Multicloud mein SD-WAN Manager cloud APIs se Catalyst 8000V gateways deploy karta hai, unhe native cloud transit constructs (AWS Transit Gateway ya Cloud WAN, Azure Virtual WAN, Google NCC) se jodta hai aur VPNs ko cloud networks se map karta hai; yeh Megaport ya Equinix ke saath Interconnect bhi automate karta hai. SaaS exit chunta hai; Multicloud fabric extend karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud OnRamp for SaaS = probes (vQoE) se per application best internet exit.</li>
<li>Site roles: DIA, gateway, client, hybrid; NAT DIA pehle se hona chahiye.</li>
<li>Cloud OnRamp for Multicloud = native cloud constructs se jude automated cloud gateways (8000V), VPNs ko cloud networks se intent mapping ke saath.</li>
<li>Cloud OnRamp for IaaS (transit VPC) purani generation hai; Interconnect Megaport ya Equinix use karta hai.</li>
<li>Alag sawaalon ke liye alag tools: DIA (nikal sakta hai?), SaaS (kaunsa exit?), Multicloud (cloud network tak kaise?).</li>
</ul></div>
`}};export{e as default};