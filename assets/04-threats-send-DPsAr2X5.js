var e={id:`threats-send`,h:{en:`First-hop threats and SEND, from the defender's side`,hi:`First-hop threats aur SEND, defender ki nazar se`},body:{en:`
<p>A bank does not train its guards by teaching them to rob banks. It teaches them what a forged cheque looks like, where the weak doors are and what to do when an alarm rings. This chapter follows the same idea. For each first-hop threat you will learn the <b>symptom</b> a user reports, <b>why the protocol allows it</b>, and <b>which feature stops it</b>. That is the knowledge the exam and a real network need.</p>

<h3>1. Rogue Router Advertisement</h3>
<p><b>What happens:</b> a device that is not a router sends RAs. Hosts add its prefix, build addresses from it and may choose it as default gateway (especially if it advertises preference High). The traffic then goes through the rogue device (interception) or into a black hole.</p>
<p><b>Variants:</b> an RA with <b>router lifetime 0</b> forged with the real router's link-local makes hosts delete their gateway (denial of service); a flood of RAs with random prefixes makes hosts build hundreds of addresses and burn CPU.</p>
<p><b>Symptom:</b> "IPv6 works inside the LAN but nothing outside", hosts with two IPv6 gateways or an unknown prefix.</p>
<p><b>Defence:</b> RA guard (chapter 7); device-tracking at guard level also blocks RAs from node ports.</p>

<h3>2. Rogue DHCPv6 server</h3>
<p><b>What happens:</b> a device answers SOLICIT or INFORMATION-REQUEST and hands out its own addresses, DNS servers and domain. Often it is a home router or a test VM, not an attacker.</p>
<p><b>Symptom:</b> wrong DNS server, unknown address range, name resolution to wrong sites.</p>
<p><b>Defence:</b> DHCPv6 guard (chapter 8).</p>

<h3>3. Neighbor spoofing (cache poisoning)</h3>
<p><b>What happens:</b> a device sends NAs, often unsolicited with the Override flag, saying "the gateway's IPv6 address is at my MAC". Neighbours update their caches. This is the IPv6 version of ARP poisoning.</p>
<p><b>Symptom:</b> intermittent loss, traffic to the gateway reaching the wrong port, duplicate address warnings.</p>
<p><b>Defence:</b> binding table with security-level guard or inspect, ND inspection (chapters 6 and 9).</p>

<h3>4. Address theft</h3>
<p><b>What happens:</b> a host simply configures or uses another host's IPv6 address in its data packets, to bypass an ACL or to hide.</p>
<p><b>Defence:</b> the binding table refuses the second claim (<code>%SISF-4-IP_THEFT</code>), and <b>IPv6 source guard</b> drops data packets whose source address is not bound to that port (chapter 9, lab 3).</p>

<h3>5. DAD denial of service</h3>
<p><b>What happens:</b> a device answers every DAD probe (NS from <code>::</code>) with an NA claiming the address. The victim marks each new address as duplicate and never gets one.</p>
<p><b>Symptom:</b> "duplicate address detected" for every address a host tries.</p>
<p><b>Defence:</b> the binding table knows the address is not owned by anyone else, so a guard/inspect-level policy drops the false NA; ND inspection validates it.</p>

<h3>6. Redirect abuse</h3>
<p><b>What happens:</b> a forged ICMPv6 Redirect (type 137) that looks like it comes from the router tells a host to use another first hop.</p>
<p><b>Defence:</b> RA guard host policies drop Redirects on host ports too, and guard-level device-tracking blocks them from node ports.</p>

<h3>7. Neighbor cache exhaustion (remote)</h3>
<p><b>What happens:</b> someone scans many addresses inside a /64 from outside. For each unknown destination the router creates an INCOMPLETE neighbor entry and sends an NS, filling its cache and CPU so real hosts cannot be resolved.</p>
<p><b>Defence:</b> destination guard (only resolve addresses present in the binding table), plus router limits such as <code>ipv6 nd cache interface-limit</code> and CoPP.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Threat to defence map">
<g font-size="12">
<rect x="20" y="15" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="35" text-anchor="middle" class="svg-ink">Rogue RA / Redirect</text>
<rect x="20" y="55" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="75" text-anchor="middle" class="svg-ink">Rogue DHCPv6 server</text>
<rect x="20" y="95" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="115" text-anchor="middle" class="svg-ink">NA spoofing, DAD DoS</text>
<rect x="20" y="135" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="155" text-anchor="middle" class="svg-ink">Address theft (data)</text>
<rect x="20" y="175" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="195" text-anchor="middle" class="svg-ink">Remote cache exhaustion</text>
<rect x="370" y="15" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="35" text-anchor="middle" class="svg-ink">RA guard</text>
<rect x="370" y="55" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="75" text-anchor="middle" class="svg-ink">DHCPv6 guard</text>
<rect x="370" y="95" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="115" text-anchor="middle" class="svg-ink">Binding table + ND inspection</text>
<rect x="370" y="135" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="155" text-anchor="middle" class="svg-ink">Source guard / prefix guard</text>
<rect x="370" y="175" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="195" text-anchor="middle" class="svg-ink">Destination guard</text>
<line x1="270" y1="30" x2="370" y2="30" stroke="#64748b" stroke-width="2"/><line x1="270" y1="70" x2="370" y2="70" stroke="#64748b" stroke-width="2"/><line x1="270" y1="110" x2="370" y2="110" stroke="#64748b" stroke-width="2"/><line x1="270" y1="150" x2="370" y2="150" stroke="#64748b" stroke-width="2"/><line x1="270" y1="190" x2="370" y2="190" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="225" width="400" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="247" text-anchor="middle" class="svg-ink">All rely on the SISF binding table on the access switch</text>
</g></svg><p class="cap">Each threat has a matching switch feature; most of them depend on the binding table.</p></div>

<h3>SEND: fixing the protocol itself</h3>
<p><b>SEcure Neighbor Discovery (SEND)</b>, RFC 3971, adds cryptography to NDP:</p>
<ul>
<li><b>CGA (Cryptographically Generated Addresses, RFC 3972):</b> the interface ID is a hash of the host's public key (plus a modifier and the prefix). Only the holder of the private key can prove ownership of that address.</li>
<li><b>RSA Signature option:</b> NDP messages are signed with that key.</li>
<li><b>Timestamp and Nonce options:</b> stop replay of old messages.</li>
<li><b>Router authorisation:</b> routers carry certificates; hosts check them against a trust anchor using Certification Path Solicitation and Advertisement messages (ICMPv6 148 and 149), so only authorised routers may send RAs for a prefix.</li>
</ul>
<p>SEND is elegant but <b>rarely deployed</b>: major desktop and mobile operating systems do not implement it natively, it needs a PKI for routers, and signing costs CPU. The industry therefore moved the protection into the network: switch-based FHS works with any host. SISF can still recognise SEND-protected entries (the binding table has preference flags for "CGA authenticated" and "Cert authenticated"), and ND inspection can drop unsecured messages with <code>drop-unsecure</code>, but you will almost never see SEND in production.</p>

<div class="eg"><p><b>Worked example.</b> A user reports: "My laptop shows two IPv6 gateways, <code>fe80::1</code> and <code>fe80::5054:ff:feab:cd03</code>, and Internet via IPv6 fails." Map it: two gateways means two RA senders, threat 1. Find the second sender's MAC (5254.00ab.cd03, derived from its EUI-64 link-local) in the switch MAC table: port Gi0/3. Defence: RA guard host role on Gi0/3 and the other user ports. This is lab 1.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing one threat and assuming the link is safe. RA guard alone does not stop NA spoofing or address theft; DHCPv6 guard alone does not stop a rogue RA. Plan the full set, built on one binding table.</p></div>

<div class="exam"><p><b>Exam trap.</b> SEND uses <b>CGA and RSA signatures</b>, not IPsec. Older texts suggested IPsec for NDP, but manual keying for multicast NDP is impractical. Also, SEND is a host/router protocol, while RA guard is a switch feature (RFC 6105).</p></div>

<div class="scn"><h4>Every new laptop is a "duplicate"</h4><p>On one floor, newly connected laptops kept reporting "duplicate IPv6 address" and fell back to link-local only. Older laptops were fine because their addresses were already in use. <code>show ipv6 snooping counters</code> was not available because no FHS was configured. A capture showed one machine answering every DAD NS on the VLAN. It was a misconfigured network appliance in a proxy mode. The team removed it, then enabled device-tracking at <code>security-level guard</code> on the access ports so that such claims would be rejected in future.</p><p><b>Lesson:</b> DAD DoS looks like a DHCP or OS problem; think of it whenever every new address becomes duplicate.</p></div>

<div class="iv"><p class="q">"What is SEND and why is it not widely used?"</p><p>SEND (RFC 3971) secures NDP with CGA addresses bound to a public key, RSA signatures, timestamps and nonces, and certificate-based router authorisation. It is not widely used because common host operating systems lack native support, it needs a PKI, and it is CPU-heavy. Networks instead use switch-based FHS such as RA guard and SISF, which protects unmodified hosts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threats: rogue RA, rogue DHCPv6, NA spoofing, address theft, DAD DoS, Redirect abuse, remote cache exhaustion.</li>
<li>Router lifetime 0 in a forged RA removes the default gateway: a quiet denial of service.</li>
<li>Most defences depend on the SISF binding table on the access switch.</li>
<li>SEND = CGA + RSA signatures + timestamp/nonce + router certificates; secure but rarely deployed.</li>
<li>Switch-based FHS protects hosts without changing them.</li>
</ul></div>
`,hi:`
<p>Bank apne guards ko bank lootna sikha kar train nahi karta. Woh unhe sikhata hai ki forged cheque kaisa dikhta hai, kamzor darwaze kahan hain aur alarm baje to kya karna hai. Yeh chapter bhi isi idea par chalta hai. Har first-hop threat ke liye aap seekhoge ki user kaunsa <b>symptom</b> report karta hai, <b>protocol ise kyun hone deta hai</b>, aur <b>kaunsa feature ise rokta hai</b>. Exam aur asli network ko yahi knowledge chahiye.</p>

<h3>1. Rogue Router Advertisement</h3>
<p><b>Kya hota hai:</b> ek device jo router nahi hai, RAs bhejta hai. Hosts uska prefix jod lete hain, usse addresses banate hain aur use default gateway chun sakte hain (khaaskar agar woh preference High advertise kare). Phir traffic rogue device se hokar jaata hai (interception) ya black hole mein.</p>
<p><b>Variants:</b> asli router ke link-local se forge kiya gaya <b>router lifetime 0</b> wala RA hosts se unka gateway delete karwa deta hai (denial of service); random prefixes wale RAs ki baadh hosts se sainkdon addresses banwa kar CPU jala deti hai.</p>
<p><b>Symptom:</b> "IPv6 LAN ke andar chalta hai par bahar kuch nahi", hosts par do IPv6 gateways ya anjaan prefix.</p>
<p><b>Defence:</b> RA guard (chapter 7); guard level par device-tracking bhi node ports se RAs block karta hai.</p>

<h3>2. Rogue DHCPv6 server</h3>
<p><b>Kya hota hai:</b> ek device SOLICIT ya INFORMATION-REQUEST ka jawab deta hai aur apne addresses, DNS servers aur domain de deta hai. Aksar yeh home router ya test VM hota hai, attacker nahi.</p>
<p><b>Symptom:</b> galat DNS server, anjaan address range, naam galat sites par resolve hona.</p>
<p><b>Defence:</b> DHCPv6 guard (chapter 8).</p>

<h3>3. Neighbor spoofing (cache poisoning)</h3>
<p><b>Kya hota hai:</b> ek device NAs bhejta hai, aksar Override flag ke saath unsolicited, kehta hai "gateway ka IPv6 address mere MAC par hai". Padosi apni caches update kar lete hain. Yeh ARP poisoning ka IPv6 version hai.</p>
<p><b>Symptom:</b> beech beech mein loss, gateway ka traffic galat port par pahunchna, duplicate address warnings.</p>
<p><b>Defence:</b> security-level guard ya inspect ke saath binding table, ND inspection (chapters 6 aur 9).</p>

<h3>4. Address theft</h3>
<p><b>Kya hota hai:</b> ek host bas kisi aur host ka IPv6 address configure karke apne data packets mein use karta hai, ACL bypass karne ya chhupne ke liye.</p>
<p><b>Defence:</b> binding table doosra claim thukra deti hai (<code>%SISF-4-IP_THEFT</code>), aur <b>IPv6 source guard</b> un data packets ko drop karta hai jinka source address us port par bound nahi hai (chapter 9, lab 3).</p>

<h3>5. DAD denial of service</h3>
<p><b>Kya hota hai:</b> ek device har DAD probe (<code>::</code> se NS) ka jawab NA se deta hai, address ko apna batata hai. Victim har naye address ko duplicate maan leta hai aur use kabhi address nahi milta.</p>
<p><b>Symptom:</b> host jo bhi address try kare, us par "duplicate address detected".</p>
<p><b>Defence:</b> binding table jaanti hai ki address kisi aur ka nahi hai, isliye guard/inspect-level policy jhootha NA drop karti hai; ND inspection use validate karta hai.</p>

<h3>6. Redirect ka galat use</h3>
<p><b>Kya hota hai:</b> ek forged ICMPv6 Redirect (type 137), jo router se aaya lagta hai, host ko doosra first hop use karne ko kehta hai.</p>
<p><b>Defence:</b> RA guard host policies host ports par Redirects bhi drop karti hain, aur guard-level device-tracking unhe node ports se block karta hai.</p>

<h3>7. Neighbor cache exhaustion (remote)</h3>
<p><b>Kya hota hai:</b> koi bahar se ek /64 ke andar bahut saare addresses scan karta hai. Har anjaan destination ke liye router ek INCOMPLETE neighbor entry banata hai aur NS bhejta hai, jisse uski cache aur CPU bhar jaate hain aur asli hosts resolve nahi ho paate.</p>
<p><b>Defence:</b> destination guard (sirf binding table mein maujood addresses resolve karo), plus router limits jaise <code>ipv6 nd cache interface-limit</code> aur CoPP.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Threat se defence map">
<g font-size="12">
<rect x="20" y="15" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="35" text-anchor="middle" class="svg-ink">Rogue RA / Redirect</text>
<rect x="20" y="55" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="75" text-anchor="middle" class="svg-ink">Rogue DHCPv6 server</text>
<rect x="20" y="95" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="115" text-anchor="middle" class="svg-ink">NA spoofing, DAD DoS</text>
<rect x="20" y="135" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="155" text-anchor="middle" class="svg-ink">Address theft (data)</text>
<rect x="20" y="175" width="250" height="30" rx="6" fill="#fed7aa"/><text x="145" y="195" text-anchor="middle" class="svg-ink">Remote cache exhaustion</text>
<rect x="370" y="15" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="35" text-anchor="middle" class="svg-ink">RA guard</text>
<rect x="370" y="55" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="75" text-anchor="middle" class="svg-ink">DHCPv6 guard</text>
<rect x="370" y="95" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="115" text-anchor="middle" class="svg-ink">Binding table + ND inspection</text>
<rect x="370" y="135" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="155" text-anchor="middle" class="svg-ink">Source guard / prefix guard</text>
<rect x="370" y="175" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="495" y="195" text-anchor="middle" class="svg-ink">Destination guard</text>
<line x1="270" y1="30" x2="370" y2="30" stroke="#64748b" stroke-width="2"/><line x1="270" y1="70" x2="370" y2="70" stroke="#64748b" stroke-width="2"/><line x1="270" y1="110" x2="370" y2="110" stroke="#64748b" stroke-width="2"/><line x1="270" y1="150" x2="370" y2="150" stroke="#64748b" stroke-width="2"/><line x1="270" y1="190" x2="370" y2="190" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="225" width="400" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="247" text-anchor="middle" class="svg-ink">Sab access switch ki SISF binding table par tike hain</text>
</g></svg><p class="cap">Har threat ka ek matching switch feature hai; zyada tar binding table par depend karte hain.</p></div>

<h3>SEND: protocol ko hi theek karna</h3>
<p><b>SEcure Neighbor Discovery (SEND)</b>, RFC 3971, NDP mein cryptography jodta hai:</p>
<ul>
<li><b>CGA (Cryptographically Generated Addresses, RFC 3972):</b> interface ID host ki public key (plus ek modifier aur prefix) ka hash hota hai. Sirf private key wala hi us address ki ownership prove kar sakta hai.</li>
<li><b>RSA Signature option:</b> NDP messages us key se sign hote hain.</li>
<li><b>Timestamp aur Nonce options:</b> purane messages ka replay rokte hain.</li>
<li><b>Router authorisation:</b> routers ke paas certificates hote hain; hosts Certification Path Solicitation aur Advertisement messages (ICMPv6 148 aur 149) se unhe trust anchor ke against check karte hain, taaki sirf authorised routers hi kisi prefix ke liye RAs bhej sakein.</li>
</ul>
<p>SEND elegant hai par <b>bahut kam deploy hota hai</b>: bade desktop aur mobile operating systems ise natively implement nahi karte, routers ke liye PKI chahiye, aur signing mein CPU lagta hai. Isliye industry ne protection network mein daal di: switch-based FHS kisi bhi host ke saath kaam karta hai. SISF phir bhi SEND-protected entries pehchan sakta hai (binding table mein "CGA authenticated" aur "Cert authenticated" ke preference flags hain), aur ND inspection <code>drop-unsecure</code> se unsecured messages drop kar sakta hai, par production mein aap SEND lagbhag kabhi nahi dekhoge.</p>

<div class="eg"><p><b>Worked example.</b> User report karta hai: "Mere laptop par do IPv6 gateways dikh rahe hain, <code>fe80::1</code> aur <code>fe80::5054:ff:feab:cd03</code>, aur IPv6 se Internet fail hai." Map karo: do gateways matlab do RA senders, threat 1. Doosre sender ka MAC (5254.00ab.cd03, uske EUI-64 link-local se nikla) switch MAC table mein dhoondho: port Gi0/3. Defence: Gi0/3 aur baaki user ports par RA guard host role. Yahi lab 1 hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek threat fix karke maan lena ki link safe hai. Akela RA guard NA spoofing ya address theft nahi rokta; akela DHCPv6 guard rogue RA nahi rokta. Poora set plan karo, ek hi binding table par bana hua.</p></div>

<div class="exam"><p><b>Exam trap.</b> SEND <b>CGA aur RSA signatures</b> use karta hai, IPsec nahi. Purane texts NDP ke liye IPsec suggest karte the, par multicast NDP ke liye manual keying practical nahi hai. Aur SEND host/router protocol hai, jabki RA guard switch feature hai (RFC 6105).</p></div>

<div class="scn"><h4>Har naya laptop "duplicate"</h4><p>Ek floor par naye connect hue laptops baar baar "duplicate IPv6 address" report karke sirf link-local par aa jaate the. Purane laptops theek the kyunki unke addresses pehle se use mein the. <code>show ipv6 snooping counters</code> available nahi tha kyunki koi FHS configured nahi tha. Capture ne dikhaya ki ek machine VLAN ke har DAD NS ka jawab de rahi thi. Woh proxy mode mein galat configure hua ek network appliance tha. Team ne use hataya, phir access ports par <code>security-level guard</code> ke saath device-tracking enable kiya taaki aage aise claims reject hon.</p><p><b>Seekh:</b> DAD DoS DHCP ya OS problem jaisa dikhta hai; jab bhi har naya address duplicate bane, iske baare mein socho.</p></div>

<div class="iv"><p class="q">"SEND kya hai aur yeh zyada use kyun nahi hota?"</p><p>SEND (RFC 3971) NDP ko public key se bandhe CGA addresses, RSA signatures, timestamps aur nonces, aur certificate-based router authorisation se secure karta hai. Yeh zyada use nahi hota kyunki common host operating systems mein native support nahi hai, PKI chahiye, aur CPU-heavy hai. Networks iski jagah RA guard aur SISF jaisa switch-based FHS use karte hain, jo bina badle hosts ko protect karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threats: rogue RA, rogue DHCPv6, NA spoofing, address theft, DAD DoS, Redirect ka galat use, remote cache exhaustion.</li>
<li>Forged RA mein router lifetime 0 default gateway hata deta hai: ek chupchaap denial of service.</li>
<li>Zyada tar defences access switch ki SISF binding table par depend karte hain.</li>
<li>SEND = CGA + RSA signatures + timestamp/nonce + router certificates; secure par kam deploy hota hai.</li>
<li>Switch-based FHS hosts ko badle bina protect karta hai.</li>
</ul></div>
`}};export{e as default};