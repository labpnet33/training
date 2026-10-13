var e={id:`zones`,h:{en:`Security zones, screened subnets, segmentation and compliance`,hi:`Security zones, screened subnets, segmentation aur compliance`},body:{en:`
<p>Think of a family home. The street outside is <b>untrusted</b>: anyone walks there. The inside of the house is <b>trusted</b>: only family. Between them is the verandah, where the courier, the plumber and the neighbours are received. They can reach the verandah, but not the bedrooms. Networks use exactly this design: an untrusted zone, a trusted zone, and a <b>screened subnet</b> in between for services that outsiders must reach.</p>

<h3>Trusted, untrusted and screened subnet</h3>
<ul>
<li><b>Untrusted zone</b>: networks you do not control, above all the internet.</li>
<li><b>Trusted zone</b>: the internal network with users, servers and management.</li>
<li><b>Screened subnet</b> (the older name is <b>DMZ</b>): a separate segment for public-facing servers such as the web server, mail relay or VPN portal. The internet may reach only the specific services there; if one server is compromised, the attacker is still outside the trusted zone.</li>
</ul>
<p>A firewall with three interfaces, or two firewalls in series, enforces the rules between zones: internet to screened subnet on published ports only; screened subnet to trusted only for specific back-end connections such as the web server to the database on one port; trusted to internet through filtering; and nothing unsolicited from the internet into the trusted zone.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Three-zone firewall design">
<rect x="10" y="85" width="120" height="50" rx="10" fill="#fed7aa"/><text x="70" y="108" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="70" y="125" text-anchor="middle" class="svg-muted" font-size="12">untrusted</text>
<rect x="250" y="80" width="140" height="60" rx="10" fill="#e2e8f0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text>
<rect x="500" y="20" width="130" height="50" rx="10" fill="#fde68a"/><text x="565" y="42" text-anchor="middle" class="svg-ink" font-size="13">Screened subnet</text><text x="565" y="59" text-anchor="middle" class="svg-muted" font-size="12">web, mail relay</text>
<rect x="500" y="150" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="565" y="172" text-anchor="middle" class="svg-ink" font-size="13">Internal LAN</text><text x="565" y="189" text-anchor="middle" class="svg-muted" font-size="12">trusted</text>
<line x1="130" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="500" y2="45" stroke="#64748b" stroke-width="2"/><line x1="390" y1="120" x2="500" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="190" y="100" text-anchor="middle" class="svg-accent" font-size="12">443 only</text>
<text x="450" y="160" text-anchor="middle" class="svg-muted" font-size="12">no inbound</text>
</svg><p class="cap">Outsiders reach the screened subnet on published ports; the trusted zone stays closed.</p></div>

<h3>Network segmentation enforcement</h3>
<p>Segmentation splits the network into zones (VLANs, subnets, VRFs or firewall zones) and enforces rules between them with ACLs and firewalls. It limits how far an attacker or worm can spread (the <b>blast radius</b>) and shrinks the scope of audits. N10-009 names four segments you must be able to justify:</p>
<table class="cmp"><tr><th>Segment</th><th>Why separate it</th><th>Typical enforcement</th></tr>
<tr><td><b>IoT and IIoT</b></td><td>Cameras, sensors, smart TVs, badge readers and industrial sensors often run old firmware, cannot run security agents and are rarely patched</td><td>Own VLAN; allow only traffic to their controller or cloud service; block access to user and server VLANs</td></tr>
<tr><td><b>SCADA, ICS and OT</b></td><td>Industrial control systems run factories, power and water; availability and safety come first, and many protocols have no security</td><td>Strict isolation behind dedicated firewalls, sometimes air-gapped; one-way or tightly limited links to IT; remote access only through a jump host</td></tr>
<tr><td><b>Guest</b></td><td>Visitors' devices are unknown and unmanaged</td><td>Internet only, client isolation on Wi-Fi, captive portal, the guest ACL from the previous chapter</td></tr>
<tr><td><b>BYOD</b></td><td>Personal devices of employees are partly managed at best</td><td>Separate SSID/VLAN, NAC posture checks, mobile device management, access only to approved apps</td></tr>
</table>

<h3>Audits and regulatory compliance</h3>
<p>An <b>audit</b> is a formal check that controls exist and work, done internally or by an outside assessor. Auditors ask for evidence: configurations, ACL reviews, access logs, change records, test results such as the refused SSH from PC-USER in Lab 1. <b>Regulatory compliance</b> means meeting the laws and industry standards that apply to your data:</p>
<ul>
<li><b>PCI DSS</b> (Payment Card Industry Data Security Standard): applies to anyone who stores, processes or transmits payment card data. It requires firewalls and segmentation, encryption of card data, strong access control, logging and regular vulnerability scans. Segmentation matters because only the <b>cardholder data environment</b> and systems connected to it are in scope.</li>
<li><b>GDPR</b> (General Data Protection Regulation): the EU law protecting personal data of people in the EU, wherever the company is. It requires a lawful basis for processing, data minimisation, security of processing, rights such as access and erasure, and notification of personal-data breaches to the authority within 72 hours where required.</li>
<li><b>Data locality</b> (data residency): laws or contracts that require certain data to be stored or processed inside a specific country or region. It affects which cloud region you choose, where backups go and whether logs may leave the country.</li>
</ul>

<div class="eg"><p><b>Worked example: shrinking PCI scope.</b> A retail store has 12 point-of-sale terminals on a flat network with 80 office PCs, so all 92 devices are in PCI scope. The engineer moves the terminals (static addresses) to VLAN 30, 10.0.30.0/24, and allows only what they need:</p>
<pre class="code">ip access-list extended POS-IN
 permit tcp 10.0.30.0 0.0.0.255 host 203.0.113.50 eq 443   <span class="c">! payment gateway</span>
 permit udp 10.0.30.0 0.0.0.255 host 10.0.99.53 eq domain  <span class="c">! internal DNS</span>
 deny   ip any any log
interface GigabitEthernet0/0.30
 ip access-group POS-IN in</pre>
<p>Now the audit covers 12 terminals and the devices that enforce their segment, not 92 machines, and the log proves the segment is enforced.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating VLANs but routing freely between them with no ACL or firewall, which is separation without enforcement. Putting IoT cameras on the user VLAN "because they need the recording server". Allowing the screened-subnet web server to open any connection into the trusted zone. Choosing a cloud region without checking data-locality rules.</p></div>

<div class="exam"><p><b>Exam trap.</b> The screened subnet is the modern name for DMZ. PCI DSS = payment card data; GDPR = personal data of people in the EU; data locality = where data physically resides. Segmentation reduces PCI scope. SCADA/ICS/OT is isolated because it prioritises availability and safety and often cannot be patched.</p></div>

<div class="scn"><h4>The smart camera that became a foothold</h4><p>A manufacturer's security team saw a CCTV camera scanning the finance file server. The cameras had been installed on the office VLAN years earlier with default passwords. The team moved all cameras and badge readers into an IoT VLAN, allowed only RTSP and management traffic to the video recorder and the controller, changed every default password and put the factory's PLC network behind its own firewall with remote access only through a jump host. The next audit passed with no segmentation findings.</p><p><b>Lesson:</b> IoT and OT devices are hard to secure individually, so you secure the segment around them.</p></div>

<div class="iv"><p class="q">"How would you segment a network that has corporate users, guests, IoT devices and card-payment terminals?"</p><p>Separate VLANs and subnets per group, enforced by ACLs or a firewall: guests to the internet only, IoT only to their controllers, payment terminals only to the payment gateway to shrink PCI scope, users to approved server segments, and public servers in a screened subnet. Mention logging on deny rules as audit evidence, and BYOD with NAC posture checks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zones: untrusted (internet), trusted (internal), screened subnet (public-facing servers, formerly DMZ).</li>
<li>Segmentation must be enforced with ACLs or firewalls, not just VLANs.</li>
<li>Isolate IoT/IIoT, SCADA/ICS/OT, guest and BYOD devices, each for its own reason.</li>
<li>PCI DSS protects card data and rewards segmentation; GDPR protects EU personal data; data locality controls where data lives.</li>
<li>Audits need evidence: configs, logs, change records and test results.</li>
</ul></div>
`,hi:`
<p>Ek family ghar socho. Bahar ki sadak <b>untrusted</b> hai: koi bhi wahan chalta hai. Ghar ke andar <b>trusted</b> hai: sirf family. Dono ke beech verandah hai, jahan courier, plumber aur padosi ko receive kiya jaata hai. Woh verandah tak pahunch sakte hain, lekin bedrooms tak nahi. Networks bilkul yahi design use karte hain: ek untrusted zone, ek trusted zone, aur beech mein un services ke liye <b>screened subnet</b> jin tak bahar walon ka pahunchna zaroori hai.</p>

<h3>Trusted, untrusted aur screened subnet</h3>
<ul>
<li><b>Untrusted zone</b>: woh networks jo aap control nahi karte, sabse upar internet.</li>
<li><b>Trusted zone</b>: users, servers aur management wala internal network.</li>
<li><b>Screened subnet</b> (purana naam <b>DMZ</b>): public-facing servers jaise web server, mail relay ya VPN portal ke liye alag segment. Internet wahan sirf specific services tak pahunch sakta hai; agar ek server compromise ho jaaye, to attacker ab bhi trusted zone ke bahar hai.</li>
</ul>
<p>Teen interfaces wala firewall, ya series mein do firewalls, zones ke beech rules enforce karte hain: internet se screened subnet tak sirf published ports; screened subnet se trusted tak sirf specific back-end connections, jaise web server se database ek port par; trusted se internet filtering ke through; aur internet se trusted zone mein bina maange kuch nahi.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Teen-zone firewall design">
<rect x="10" y="85" width="120" height="50" rx="10" fill="#fed7aa"/><text x="70" y="108" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="70" y="125" text-anchor="middle" class="svg-muted" font-size="12">untrusted</text>
<rect x="250" y="80" width="140" height="60" rx="10" fill="#e2e8f0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text>
<rect x="500" y="20" width="130" height="50" rx="10" fill="#fde68a"/><text x="565" y="42" text-anchor="middle" class="svg-ink" font-size="13">Screened subnet</text><text x="565" y="59" text-anchor="middle" class="svg-muted" font-size="12">web, mail relay</text>
<rect x="500" y="150" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="565" y="172" text-anchor="middle" class="svg-ink" font-size="13">Internal LAN</text><text x="565" y="189" text-anchor="middle" class="svg-muted" font-size="12">trusted</text>
<line x1="130" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="500" y2="45" stroke="#64748b" stroke-width="2"/><line x1="390" y1="120" x2="500" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="190" y="100" text-anchor="middle" class="svg-accent" font-size="12">sirf 443</text>
<text x="450" y="160" text-anchor="middle" class="svg-muted" font-size="12">koi inbound nahi</text>
</svg><p class="cap">Bahar wale published ports par screened subnet tak pahunchte hain; trusted zone band rehta hai.</p></div>

<h3>Network segmentation enforcement</h3>
<p>Segmentation network ko zones (VLANs, subnets, VRFs ya firewall zones) mein baant-ta hai aur unke beech ACLs aur firewalls se rules enforce karta hai. Yeh seemit karta hai ki attacker ya worm kitna fail sakta hai (<b>blast radius</b>) aur audits ka scope chhota karta hai. N10-009 chaar segments ka naam leta hai jinhe aapko justify karna aana chahiye:</p>
<table class="cmp"><tr><th>Segment</th><th>Alag kyun karein</th><th>Typical enforcement</th></tr>
<tr><td><b>IoT aur IIoT</b></td><td>Cameras, sensors, smart TVs, badge readers aur industrial sensors aksar purana firmware chalate hain, security agents nahi chala sakte aur shayad hi kabhi patch hote hain</td><td>Apna VLAN; sirf unke controller ya cloud service tak traffic allow; user aur server VLANs ka access block</td></tr>
<tr><td><b>SCADA, ICS aur OT</b></td><td>Industrial control systems factories, bijli aur paani chalate hain; availability aur safety sabse pehle, aur kai protocols mein koi security nahi</td><td>Dedicated firewalls ke peeche strict isolation, kabhi kabhi air-gapped; IT tak one-way ya bahut seemit links; remote access sirf jump host se</td></tr>
<tr><td><b>Guest</b></td><td>Visitors ke devices unknown aur unmanaged hote hain</td><td>Sirf internet, Wi-Fi par client isolation, captive portal, pichhle chapter ki guest ACL</td></tr>
<tr><td><b>BYOD</b></td><td>Employees ke personal devices zyada se zyada aadhe managed hote hain</td><td>Alag SSID/VLAN, NAC posture checks, mobile device management, sirf approved apps ka access</td></tr>
</table>

<h3>Audits aur regulatory compliance</h3>
<p><b>Audit</b> ek formal check hai ki controls maujood hain aur kaam karte hain, jo internally ya bahar ke assessor se hota hai. Auditors saboot maangte hain: configurations, ACL reviews, access logs, change records, test results jaise Lab 1 mein PC-USER ka refused SSH. <b>Regulatory compliance</b> ka matlab hai aapke data par lagne wale kanoon aur industry standards poore karna:</p>
<ul>
<li><b>PCI DSS</b> (Payment Card Industry Data Security Standard): har us organisation par lagta hai jo payment card data store, process ya transmit karti hai. Yeh firewalls aur segmentation, card data ka encryption, strong access control, logging aur regular vulnerability scans maangta hai. Segmentation isliye matter karta hai kyunki sirf <b>cardholder data environment</b> aur usse jude systems scope mein hote hain.</li>
<li><b>GDPR</b> (General Data Protection Regulation): EU ka kanoon jo EU mein logon ke personal data ko bachata hai, company kahin bhi ho. Yeh processing ke liye lawful basis, data minimisation, processing ki security, access aur erasure jaise rights, aur zaroorat hone par personal-data breaches ki authority ko 72 ghante ke andar notification maangta hai.</li>
<li><b>Data locality</b> (data residency): kanoon ya contracts jo kuch data ko ek specific desh ya region ke andar store ya process karna zaroori banate hain. Isse tay hota hai ki aap kaunsa cloud region chunoge, backups kahan jaayenge aur logs desh se bahar ja sakte hain ya nahi.</li>
</ul>

<div class="eg"><p><b>Worked example: PCI scope chhota karna.</b> Ek retail store ke 12 point-of-sale terminals 80 office PCs ke saath flat network par hain, isliye saare 92 devices PCI scope mein hain. Engineer terminals (static addresses) ko VLAN 30, 10.0.30.0/24, mein le jaata hai aur sirf zaroori cheezein allow karta hai:</p>
<pre class="code">ip access-list extended POS-IN
 permit tcp 10.0.30.0 0.0.0.255 host 203.0.113.50 eq 443   <span class="c">! payment gateway</span>
 permit udp 10.0.30.0 0.0.0.255 host 10.0.99.53 eq domain  <span class="c">! internal DNS</span>
 deny   ip any any log
interface GigabitEthernet0/0.30
 ip access-group POS-IN in</pre>
<p>Ab audit 12 terminals aur unke segment ko enforce karne wale devices ko cover karta hai, 92 machines ko nahi, aur log prove karta hai ki segment enforced hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> VLANs banana lekin unke beech bina ACL ya firewall ke free routing karna, jo enforcement ke bina separation hai. IoT cameras ko user VLAN par rakhna "kyunki unhe recording server chahiye". Screened-subnet web server ko trusted zone mein koi bhi connection kholne dena. Data-locality rules check kiye bina cloud region chunna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Screened subnet DMZ ka modern naam hai. PCI DSS = payment card data; GDPR = EU ke logon ka personal data; data locality = data physically kahan rehta hai. Segmentation PCI scope kam karta hai. SCADA/ICS/OT isliye isolate hota hai kyunki woh availability aur safety ko priority deta hai aur aksar patch nahi ho sakta.</p></div>

<div class="scn"><h4>Smart camera jo foothold ban gaya</h4><p>Ek manufacturer ki security team ne dekha ki ek CCTV camera finance file server ko scan kar raha hai. Cameras saalon pehle default passwords ke saath office VLAN par lagaye gaye the. Team ne saare cameras aur badge readers ko IoT VLAN mein shift kiya, video recorder aur controller tak sirf RTSP aur management traffic allow kiya, har default password badla aur factory ke PLC network ko apne firewall ke peeche rakha jismein remote access sirf jump host se ho. Agla audit bina kisi segmentation finding ke pass hua.</p><p><b>Seekh:</b> IoT aur OT devices ko akele secure karna mushkil hai, isliye aap unke aas-paas ka segment secure karte ho.</p></div>

<div class="iv"><p class="q">"Jis network mein corporate users, guests, IoT devices aur card-payment terminals hon, use aap kaise segment karoge?"</p><p>Har group ke liye alag VLANs aur subnets, ACLs ya firewall se enforced: guests sirf internet tak, IoT sirf apne controllers tak, payment terminals sirf payment gateway tak taaki PCI scope chhota ho, users approved server segments tak, aur public servers screened subnet mein. Audit saboot ke roop mein deny rules par logging, aur NAC posture checks wale BYOD ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zones: untrusted (internet), trusted (internal), screened subnet (public-facing servers, pehle DMZ).</li>
<li>Segmentation ACLs ya firewalls se enforce hona chahiye, sirf VLANs se nahi.</li>
<li>IoT/IIoT, SCADA/ICS/OT, guest aur BYOD devices ko isolate karo, har ek apni wajah se.</li>
<li>PCI DSS card data bachata hai aur segmentation ka fayda deta hai; GDPR EU personal data bachata hai; data locality control karta hai ki data kahan rehta hai.</li>
<li>Audits ko saboot chahiye: configs, logs, change records aur test results.</li>
</ul></div>
`}};export{e as default};