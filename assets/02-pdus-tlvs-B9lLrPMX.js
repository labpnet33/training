var e={id:`pdus-tlvs`,h:{en:`How IS-IS talks: PDUs, TLVs and the link-state database`,hi:`IS-IS kaise baat karta hai: PDUs, TLVs aur link-state database`},body:{en:`
<p>Imagine a postal system with four kinds of envelope: a greeting card (to meet a neighbour), a full letter describing your house (your own details), an index of all the letters you hold (a table of contents), and a request slip for a missing letter. IS-IS has exactly these four: <b>hello, LSP, CSNP and PSNP</b>. Each is a <b>PDU</b> (protocol data unit), the ISO word for a packet. Inside each envelope the information is split into small labelled boxes called <b>TLVs</b>.</p>

<h3>Not on top of IP</h3>
<p>An IS-IS PDU sits directly in an Ethernet frame behind an 802.2 LLC header (DSAP and SSAP 0xFE) and the ISO protocol identifier 0x83. There is no IP header, no UDP, no TCP. Level 1 PDUs use the multicast MAC 01:80:C2:00:00:14 and level 2 use 01:80:C2:00:00:15. This explains three practical facts you will meet again and again:</p>
<ul>
<li>An interface needs <code>family iso</code> before IS-IS can use it.</li>
<li>An IP firewall filter does not see IS-IS; you need an ISO or layer 2 filter to block it.</li>
<li>The IP address plan can be wrong and the adjacency still forms, but then traffic does not flow.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="IS-IS PDU inside an Ethernet frame">
<rect x="20" y="40" width="110" height="50" rx="6" fill="#e2e8f0"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="12">Ethernet header</text>
<rect x="135" y="40" width="90" height="50" rx="6" fill="#fde68a"/><text x="180" y="70" text-anchor="middle" class="svg-ink" font-size="12">LLC 0xFE</text>
<rect x="230" y="40" width="110" height="50" rx="6" fill="#fed7aa"/><text x="285" y="70" text-anchor="middle" class="svg-ink" font-size="12">IS-IS header</text>
<rect x="345" y="40" width="85" height="50" rx="6" fill="#bbf7d0"/><text x="387" y="70" text-anchor="middle" class="svg-ink" font-size="12">TLV</text>
<rect x="435" y="40" width="85" height="50" rx="6" fill="#bbf7d0"/><text x="477" y="70" text-anchor="middle" class="svg-ink" font-size="12">TLV</text>
<rect x="525" y="40" width="95" height="50" rx="6" fill="#bbf7d0"/><text x="572" y="70" text-anchor="middle" class="svg-ink" font-size="12">TLV ...</text>
<text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">No IP header anywhere</text>
</svg><p class="cap">IS-IS rides straight inside the data link frame.</p></div>

<h3>The four PDU families</h3>
<table class="cmp"><tr><th>PDU</th><th>Type numbers</th><th>Job</th></tr>
<tr><td>IIH (hello)</td><td>15 L1 LAN, 16 L2 LAN, 17 point-to-point</td><td>find neighbours, keep adjacencies alive, elect the DIS</td></tr>
<tr><td>LSP</td><td>18 L1, 20 L2</td><td>describes a router: its neighbours and prefixes</td></tr>
<tr><td>CSNP</td><td>24 L1, 25 L2</td><td>complete list of LSP headers; sent by the DIS every 10 s on a LAN, once at start-up on point-to-point</td></tr>
<tr><td>PSNP</td><td>26 L1, 27 L2</td><td>ask for a missing LSP, or acknowledge an LSP on point-to-point links</td></tr></table>
<ul>
<li>Each router originates <b>one LSP per level</b> (plus extra fragments if it gets large), compared with OSPF where there are many LSAs per router.</li>
<li>An LSP is named by its <b>LSP ID</b>: system ID, pseudonode ID, fragment number. For example <code>R2.00-00</code> is router R2 itself, fragment 0; <code>R1.01-00</code> is the pseudonode that R1 creates as DIS for circuit 1.</li>
<li>LSPs have a sequence number, a checksum and a remaining lifetime. The default maximum lifetime is 1200 seconds, and the originator refreshes before it expires. The higher sequence number wins.</li>
<li>On a point-to-point link every LSP is acknowledged with a PSNP. On a LAN the DIS multicasts CSNPs and routers request what they miss with PSNPs.</li>
</ul>

<h3>TLVs: the labelled boxes</h3>
<table class="cmp"><tr><th>TLV</th><th>Carries</th></tr>
<tr><td>1</td><td>area addresses of the router</td></tr>
<tr><td>6</td><td>MAC addresses of neighbours heard on the LAN</td></tr>
<tr><td>10</td><td>authentication information</td></tr>
<tr><td>22 and 135</td><td>wide-metric IS neighbours and wide-metric IP prefixes</td></tr>
<tr><td>2 and 128, 130</td><td>old narrow-metric neighbours, internal and external prefixes (link metric up to 63)</td></tr>
<tr><td>132</td><td>IP interface addresses</td></tr>
<tr><td>137</td><td>dynamic hostname, why Junos shows <code>R2</code> instead of a system ID</td></tr>
<tr><td>240</td><td>point-to-point three-way handshake</td></tr></table>
<p>Because every feature is a new TLV, an old router can ignore a TLV it does not know and continue to work. That is the extensibility we praised in chapter 1.</p>

<h3>Reading the database</h3>
<p>Here is the level 2 database on R2 in the first lab, with the LSP list and then the detail. This is real output from the simulator.</p>
<pre class="out">lab@R2&gt; show isis database
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x2   0xfd23     1144 L1 L2
R2.00-00                         0x3   0xf4fc     1143 L1 L2
R3.00-00                         0x2   0x474b     1143 L1 L2
  <span class="hl">3 LSPs</span>
lab@R2&gt; show isis database detail
R2.00-00 Sequence: 0x3, Checksum: 0xf4fc, Lifetime: 1143 secs
   IS neighbor: R1.00                          Metric:       10
   IS neighbor: R3.00                          Metric:       10
   IP prefix: 10.40.12.0/30                    Metric:       10 Internal Up
   IP prefix: 10.40.23.0/30                    Metric:       10 Internal Up
   IP prefix: 10.40.255.2/32                   Metric:        0 Internal Up</pre>
<p>Three LSPs for three routers: every router has been heard. In the detail view, <code>IS neighbor</code> lines are the links (TLV 22) and <code>IP prefix</code> lines are the prefixes (TLV 135). The loopback has metric 0 and each link metric 10. The hostname comes from TLV 137, so you read R2 instead of 0100.4025.5002. <code>show isis hostname</code> maps system IDs to names:</p>
<pre class="out">lab@R1&gt; show isis hostname
IS-IS hostname database:
System ID      Hostname                      Type
0100.4025.5001 R1                            Static
0100.4025.5002 R2                            Dynamic
0100.4025.5003 R3                            Dynamic</pre>
<p>R1's own entry is Static because R1 is the local router; R2 and R3 are learned dynamically from TLV 137.</p>

<div class="eg"><p><b>Worked example.</b> R3's loopback 10.40.255.3/32 is inside R3.00-00 with metric 0. R1 learns that LSP via R2, runs SPF and finds the path R1 to R2 (10) to R3 (10) to the loopback (0), total 20. It installs <code>10.40.255.3/32 [IS-IS/18] metric 20</code>. The 18 is the level 2 internal route preference you will meet again in chapter 6.</p></div>

<div class="warn"><p><b>Common mistake.</b> Searching for IS-IS in a packet capture with an IP filter such as <code>ip proto 89</code>. IS-IS will not match; capture on the interface without that filter and look for IIH PDUs.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which PDU does what: IIH forms and maintains adjacencies, LSP carries topology, CSNP is the summary the DIS sends every 10 seconds, PSNP requests or acknowledges. IIH type 17 is the point-to-point hello; types 15 and 16 are LAN hellos.</p></div>

<div class="scn"><h4>The capture that looked empty</h4><p>An engineer used to OSPF captured traffic on a core link with the filter <code>ip proto 89</code> and saw nothing, concluding the router was silent. Removing the filter showed IIH hellos every 9 seconds. The real problem was that one end sent a LAN hello (type 16) and the other a point-to-point hello (type 17), because only one side had <code>point-to-point</code> configured.</p><p><b>Lesson:</b> use the right filter for the protocol, and remember that LAN and point-to-point hellos are different PDUs.</p></div>

<div class="iv"><p class="q">"What are the IS-IS PDU types and what does each do?"</p><p>IIH hellos discover and maintain neighbours; LSPs describe each router, one per level; CSNPs give a full database summary, periodically from the DIS on a LAN; PSNPs request a missing LSP or acknowledge one on point-to-point links. Everything is encoded as TLVs, which is why IS-IS extends easily and why it runs without IP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS PDUs sit directly in the Ethernet frame, not in IP.</li>
<li>Four PDU families: IIH, LSP, CSNP, PSNP, each with L1 and L2 versions.</li>
<li>One LSP per router per level; the LSP ID ends in <code>-00</code> for the router itself, and non-zero for a pseudonode.</li>
<li>Point-to-point links acknowledge LSPs; LANs rely on the DIS and CSNPs.</li>
<li>TLVs carry the data; TLV 137 gives the hostname Junos shows.</li>
</ul></div>
`,hi:`
<p>Socho ek postal system hai jisme chaar kism ke envelope hain: greeting card (padosi se milne ke liye), poora letter jo aapke ghar ki details batata hai (apni details), aapke paas jitne letters hain unka index (table of contents), aur missing letter ke liye request slip. IS-IS mein bilkul yahi chaar hain: <b>hello, LSP, CSNP aur PSNP</b>. Har ek ek <b>PDU</b> (protocol data unit) hai, packet ke liye ISO ka shabd. Har envelope ke andar jaankari chhote labelled boxes mein baanti hoti hai jinhe <b>TLVs</b> kehte hain.</p>

<h3>IP ke upar nahi</h3>
<p>IS-IS PDU seedha Ethernet frame mein 802.2 LLC header (DSAP aur SSAP 0xFE) aur ISO protocol identifier 0x83 ke peeche baitha hota hai. Na IP header, na UDP, na TCP. Level 1 PDUs multicast MAC 01:80:C2:00:00:14 aur level 2 01:80:C2:00:00:15 use karte hain. Isse teen practical baatein samjhti hain jo baar-baar milengi:</p>
<ul>
<li>IS-IS ke liye interface par pehle <code>family iso</code> chahiye.</li>
<li>IP firewall filter IS-IS ko nahi dekhta; use rokne ke liye ISO ya layer 2 filter chahiye.</li>
<li>IP address plan galat ho tab bhi adjacency ban sakti hai, par traffic nahi chalta.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Ethernet frame ke andar IS-IS PDU">
<rect x="20" y="40" width="110" height="50" rx="6" fill="#e2e8f0"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="12">Ethernet header</text>
<rect x="135" y="40" width="90" height="50" rx="6" fill="#fde68a"/><text x="180" y="70" text-anchor="middle" class="svg-ink" font-size="12">LLC 0xFE</text>
<rect x="230" y="40" width="110" height="50" rx="6" fill="#fed7aa"/><text x="285" y="70" text-anchor="middle" class="svg-ink" font-size="12">IS-IS header</text>
<rect x="345" y="40" width="85" height="50" rx="6" fill="#bbf7d0"/><text x="387" y="70" text-anchor="middle" class="svg-ink" font-size="12">TLV</text>
<rect x="435" y="40" width="85" height="50" rx="6" fill="#bbf7d0"/><text x="477" y="70" text-anchor="middle" class="svg-ink" font-size="12">TLV</text>
<rect x="525" y="40" width="95" height="50" rx="6" fill="#bbf7d0"/><text x="572" y="70" text-anchor="middle" class="svg-ink" font-size="12">TLV ...</text>
<text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">Kahin bhi IP header nahi</text>
</svg><p class="cap">IS-IS seedha data link frame ke andar chalta hai.</p></div>

<h3>Chaar PDU families</h3>
<table class="cmp"><tr><th>PDU</th><th>Type numbers</th><th>Kaam</th></tr>
<tr><td>IIH (hello)</td><td>15 L1 LAN, 16 L2 LAN, 17 point-to-point</td><td>neighbours dhoondhna, adjacencies zinda rakhna, DIS elect karna</td></tr>
<tr><td>LSP</td><td>18 L1, 20 L2</td><td>router ko describe karta hai: uske neighbours aur prefixes</td></tr>
<tr><td>CSNP</td><td>24 L1, 25 L2</td><td>LSP headers ki poori list; LAN par DIS har 10 s bhejta hai, point-to-point par start-up par ek baar</td></tr>
<tr><td>PSNP</td><td>26 L1, 27 L2</td><td>missing LSP maangna, ya point-to-point links par LSP acknowledge karna</td></tr></table>
<ul>
<li>Har router <b>har level ke liye ek LSP</b> banata hai (bada ho to extra fragments), jabki OSPF mein ek router ke kai LSAs hote hain.</li>
<li>LSP ka naam <b>LSP ID</b> hota hai: system ID, pseudonode ID, fragment number. Jaise <code>R2.00-00</code> router R2 khud, fragment 0; <code>R1.01-00</code> wo pseudonode jo R1 circuit 1 ke DIS ke roop mein banata hai.</li>
<li>LSPs mein sequence number, checksum aur bacha hua lifetime hota hai. Default maximum lifetime 1200 seconds hai, aur originator expire hone se pehle refresh karta hai. Bada sequence number jeetta hai.</li>
<li>Point-to-point link par har LSP PSNP se acknowledge hota hai. LAN par DIS CSNPs multicast karta hai aur routers jo kami ho wo PSNPs se maangte hain.</li>
</ul>

<h3>TLVs: labelled boxes</h3>
<table class="cmp"><tr><th>TLV</th><th>Kya le jaata hai</th></tr>
<tr><td>1</td><td>router ke area addresses</td></tr>
<tr><td>6</td><td>LAN par suno gaye neighbours ke MAC addresses</td></tr>
<tr><td>10</td><td>authentication information</td></tr>
<tr><td>22 aur 135</td><td>wide-metric IS neighbours aur wide-metric IP prefixes</td></tr>
<tr><td>2 aur 128, 130</td><td>purane narrow-metric neighbours, internal aur external prefixes (link metric 63 tak)</td></tr>
<tr><td>132</td><td>IP interface addresses</td></tr>
<tr><td>137</td><td>dynamic hostname, isliye Junos system ID ki jagah <code>R2</code> dikhata hai</td></tr>
<tr><td>240</td><td>point-to-point three-way handshake</td></tr></table>
<p>Har feature naya TLV hai, isliye purana router aisa TLV ignore karke chalta rehta hai jise wo nahi jaanta. Yahi extensibility hai jiski chapter 1 mein tareef ki thi.</p>

<h3>Database padhna</h3>
<p>Pehle lab mein R2 par level 2 database yeh hai, pehle LSP list aur phir detail. Ye simulator ka real output hai.</p>
<pre class="out">lab@R2&gt; show isis database
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x2   0xfd23     1144 L1 L2
R2.00-00                         0x3   0xf4fc     1143 L1 L2
R3.00-00                         0x2   0x474b     1143 L1 L2
  <span class="hl">3 LSPs</span>
lab@R2&gt; show isis database detail
R2.00-00 Sequence: 0x3, Checksum: 0xf4fc, Lifetime: 1143 secs
   IS neighbor: R1.00                          Metric:       10
   IS neighbor: R3.00                          Metric:       10
   IP prefix: 10.40.12.0/30                    Metric:       10 Internal Up
   IP prefix: 10.40.23.0/30                    Metric:       10 Internal Up
   IP prefix: 10.40.255.2/32                   Metric:        0 Internal Up</pre>
<p>Teen routers ke liye teen LSPs: har router suna ja chuka hai. Detail view mein <code>IS neighbor</code> lines links hain (TLV 22) aur <code>IP prefix</code> lines prefixes (TLV 135). Loopback ka metric 0 aur har link ka metric 10 hai. Hostname TLV 137 se aata hai, isliye aap 0100.4025.5002 ki jagah R2 padhte ho. <code>show isis hostname</code> system IDs ko naamon se map karta hai:</p>
<pre class="out">lab@R1&gt; show isis hostname
IS-IS hostname database:
System ID      Hostname                      Type
0100.4025.5001 R1                            Static
0100.4025.5002 R2                            Dynamic
0100.4025.5003 R3                            Dynamic</pre>
<p>R1 ki apni entry Static hai kyunki R1 local router hai; R2 aur R3 TLV 137 se dynamically seekhe gaye hain.</p>

<div class="eg"><p><b>Worked example.</b> R3 ka loopback 10.40.255.3/32 R3.00-00 ke andar metric 0 ke saath hai. R1 wo LSP R2 se seekhta hai, SPF chalata hai aur path paata hai R1 se R2 (10) se R3 (10) se loopback (0), total 20. Wo <code>10.40.255.3/32 [IS-IS/18] metric 20</code> install karta hai. 18 level 2 internal route preference hai jo chapter 6 mein dobara milegi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Packet capture mein <code>ip proto 89</code> jaise IP filter se IS-IS dhoondhna. IS-IS match nahi hoga; us filter ke bina interface par capture karo aur IIH PDUs dhoondho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano ki kaun sa PDU kya karta hai: IIH adjacencies banata aur banaye rakhta hai, LSP topology le jaata hai, CSNP wo summary hai jo DIS har 10 second bhejta hai, PSNP maangta ya acknowledge karta hai. IIH type 17 point-to-point hello hai; types 15 aur 16 LAN hellos hain.</p></div>

<div class="scn"><h4>Capture jo khaali dikha</h4><p>OSPF ke aadi engineer ne core link par <code>ip proto 89</code> filter se capture kiya aur kuch nahi dikha, to usne maan liya ki router chup hai. Filter hatane par har 9 second par IIH hellos dikhe. Asli problem ye thi ki ek end LAN hello (type 16) bhej raha tha aur doosra point-to-point hello (type 17), kyunki sirf ek taraf <code>point-to-point</code> configure tha.</p><p><b>Lesson:</b> protocol ke liye sahi filter use karo, aur yaad rakho ki LAN aur point-to-point hellos alag PDUs hain.</p></div>

<div class="iv"><p class="q">"IS-IS PDU types kaun se hain aur har ek kya karta hai?"</p><p>IIH hellos neighbours dhoondhte aur maintain karte hain; LSPs har router ko describe karte hain, har level ke liye ek; CSNPs poore database ka summary dete hain, LAN par DIS se periodically; PSNPs missing LSP maangte hain ya point-to-point links par acknowledge karte hain. Sab kuch TLVs mein encoded hai, isliye IS-IS aasaani se extend hota hai aur IP ke bina chalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS PDUs seedha Ethernet frame mein baithte hain, IP mein nahi.</li>
<li>Chaar PDU families: IIH, LSP, CSNP, PSNP, har ek ke L1 aur L2 versions.</li>
<li>Har router har level ke liye ek LSP; router khud ke liye LSP ID <code>-00</code> par khatam hota hai, pseudonode ke liye non-zero.</li>
<li>Point-to-point links LSPs acknowledge karte hain; LANs DIS aur CSNPs par chalti hain.</li>
<li>TLVs data le jaate hain; TLV 137 wo hostname deta hai jo Junos dikhata hai.</li>
</ul></div>
`}};export{e as default};