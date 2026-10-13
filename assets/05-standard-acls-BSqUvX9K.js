var e={id:`standard`,h:{en:`Standard ACLs and placing them close to the destination`,hi:`Standard ACLs aur unhe destination ke paas lagana`},body:{en:`
<p>Imagine a bouncer who can only read one thing on your ticket: the name of the city you came from. He cannot see which hall you are going to. If his orders are "no one from Pune goes into Hall B", he must stand at the door of <b>Hall B</b>. If he stands at the main entrance instead, he turns away every Pune visitor from the whole event, including Halls A and C. A <b>standard ACL</b> is that bouncer: it only sees the <b>source</b> address. That single fact decides where you place it.</p>

<h3>What a standard ACL can match</h3>
<p>A standard IPv4 ACL matches <b>only the source IP address</b> of the packet (with a wildcard). No destination, no protocol, no ports. That makes it simple and fast, and perfect for jobs where the question really is "who is sending this?": NAT selection, VTY access control, route filtering and simple "keep subnet X away from this LAN" rules.</p>
<table class="cmp">
<tr><th>Type</th><th>Identifier</th><th>Created with</th></tr>
<tr><td>Numbered standard</td><td>1 to 99, and the expanded range 1300 to 1999</td><td><code>access-list 10 permit ...</code></td></tr>
<tr><td>Named standard</td><td>A name, for example GUEST-BLOCK</td><td><code>ip access-list standard GUEST-BLOCK</code></td></tr>
</table>

<pre class="code"><span class="c">! Numbered standard ACL (global config)</span>
access-list 10 remark Block guest Wi-Fi from HR
access-list 10 deny   10.1.20.0 0.0.0.255
access-list 10 permit any
<span class="c">! The same policy as a named standard ACL</span>
ip access-list standard GUEST-BLOCK
 remark Block guest Wi-Fi from HR
 deny   10.1.20.0 0.0.0.255
 permit any</pre>
<p>The named version drops you into the <code>(config-std-nacl)#</code> sub-mode, where each line is an entry. Chapter 8 shows why named lists are easier to edit.</p>

<h3>Placement rule: close to the destination</h3>
<p>Because a standard ACL cannot see where a packet is going, placing it near the source blocks that source from <b>everything</b> beyond that point. Placing it near the destination affects only traffic heading to that destination. So the rule is: <b>standard ACLs go as close to the destination as possible</b>, usually outbound on the interface facing the protected LAN.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Standard ACL placement in the lab">
<rect x="20" y="40" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">PC-A Sales</text><text x="75" y="74" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.10</text>
<rect x="20" y="180" width="110" height="40" rx="8" fill="#fed7aa"/><text x="75" y="198" text-anchor="middle" class="svg-ink" font-size="13">PC-B Guest</text><text x="75" y="214" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.10</text>
<rect x="190" y="110" width="90" height="44" rx="8" fill="#bae6fd"/><text x="235" y="137" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="360" y="110" width="90" height="44" rx="8" fill="#bae6fd"/><text x="405" y="137" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="520" y="110" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="570" y="130" text-anchor="middle" class="svg-ink" font-size="13">HR server</text><text x="570" y="146" text-anchor="middle" class="svg-muted" font-size="12">10.2.50.10</text>
<line x1="130" y1="60" x2="190" y2="125" stroke="#64748b" stroke-width="2"/><line x1="130" y1="200" x2="190" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="132" x2="360" y2="132" stroke="#64748b" stroke-width="2"/><line x1="450" y1="132" x2="520" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.0/30</text>
<circle cx="470" cy="132" r="9" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="100" text-anchor="middle" class="svg-accent" font-size="12">ACL 10 out, Gi0/0</text>
<circle cx="170" cy="158" r="9" fill="#fed7aa" stroke="#64748b"/><text x="190" y="250" text-anchor="middle" class="svg-muted" font-size="12">Here (R1 Gi0/2 in) guests lose WAN too</text>
</svg><p class="cap">Lab acl-standard: the right spot is R2 Gi0/0 outbound, next to HR. Near the guests it would over-block.</p></div>

<h3>Lab walkthrough: acl-standard</h3>
<p>The lab asks: guests (10.1.20.0/24) must never reach the HR LAN (10.2.50.0/24), but may use everything else, including R2's WAN address 10.0.0.2. Sales (10.1.10.0/24) keeps full access. Candidate spots:</p>
<ul>
<li><b>R1 Gi0/2 inbound</b> (next to guests): guest packets are dropped before they go anywhere. Guests lose the WAN too. Over-blocking.</li>
<li><b>R2 Gi0/1 inbound</b>: guests can no longer reach R2's own 10.0.0.2 either. Over-blocking.</li>
<li><b>R2 Gi0/0 outbound</b> (next to HR): only packets leaving toward the HR LAN are checked. Exactly the policy.</li>
</ul>
<pre class="code">R2(config)# access-list 10 remark Block guest Wi-Fi from HR
R2(config)# access-list 10 deny 10.1.20.0 0.0.0.255
R2(config)# access-list 10 permit any
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip access-group 10 out
R2(config-if)# end</pre>
<p>Now test from the PCs, then read the counters:</p>
<pre class="out">PC-B&gt; ping 10.2.50.10
<span class="hl">*10.0.0.2 icmp_seq=1 ttl=255 time=9.8 ms (ICMP type:3, code:13, Communication administratively prohibited)</span>

R2# show access-lists
Standard IP access list 10
    10 deny   10.1.20.0, wildcard bits 0.0.0.255 <span class="hl">(5 matches)</span>
    20 permit any <span class="hl">(10 matches)</span>

R2# show ip interface GigabitEthernet0/0 | include access list
  Outgoing access list is <span class="hl">10</span>
  Inbound  access list is not set</pre>
<p>ICMP type 3 code 13 is "communication administratively prohibited": the router is telling the sender an ACL dropped the packet. Sales pings to HR increment line 20, guest pings increment line 10, and guest pings to 10.0.0.2 never touch ACL 10 at all, because they do not leave Gi0/0.</p>

<div class="eg"><p><b>Worked example: why outbound and not inbound on Gi0/0?</b> Traffic from guests to HR <b>arrives</b> at R2 on Gi0/1 and <b>leaves</b> on Gi0/0. An inbound ACL on Gi0/0 would only check packets coming <b>from</b> the HR servers, where the source is 10.2.50.x, never 10.1.20.x. The deny would never match. Always ask: on this interface, in this direction, which source addresses will I see?</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>permit any</code>. With only the deny line, the implicit deny also blocks Sales, and the ticket becomes "nobody can reach HR". A single-purpose standard ACL almost always ends with a permit.</p></div>

<div class="exam"><p><b>Exam trap.</b> Remember the ranges: standard 1 to 99 and 1300 to 1999; extended 100 to 199 and 2000 to 2699. An item may show <code>access-list 150 permit 10.1.1.0 0.0.0.255</code> and ask why it is rejected: 150 is an extended number, so IOS expects a protocol keyword.</p></div>

<div class="scn"><h4>Guests lost the internet</h4><p>A hotel's IT contractor was asked to stop the guest VLAN reaching the property-management server. He put a standard ACL denying the guest subnet inbound on the guest-facing sub-interface, close to the guests. Within minutes the front desk was flooded with complaints that the Wi-Fi "had no internet". <code>show access-lists</code> showed the deny counter racing upward for every destination. Moving the same ACL outbound on the server VLAN interface restored internet access and kept the server protected.</p><p><b>Lesson:</b> a standard ACL near the source blocks the source from everything. Put it next to what you protect.</p></div>

<div class="iv"><p class="q">"Where do you place a standard ACL and why?"</p><p>Strong answer: as close to the destination as possible, because a standard ACL only matches the source address; near the source it would block that source from every destination. Give the example: guest subnet denied outbound on the router interface facing the HR LAN, followed by permit any. Mention that the modern best practice is often an extended ACL near the source, which can be exact.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Standard ACLs match only the source IPv4 address.</li>
<li>Numbered ranges: 1 to 99 and 1300 to 1999; named ones use <code>ip access-list standard NAME</code>.</li>
<li>Place standard ACLs close to the destination, usually outbound toward the protected LAN.</li>
<li>End a "block X" list with <code>permit any</code>, or the implicit deny blocks everyone.</li>
<li>A PC sees "administratively prohibited" (ICMP 3/13) when an ACL drops its packet.</li>
</ul></div>
`,hi:`
<p>Ek aise bouncer ko socho jo aapke ticket par sirf ek cheez padh sakta hai: aap kis shehar se aaye ho. Woh yeh nahi dekh sakta ki aap kis hall mein jaa rahe ho. Agar uske orders hain "Pune se koi bhi Hall B mein nahi jaayega", to use <b>Hall B</b> ke darwaze par khada hona padega. Agar woh main entrance par khada ho gaya, to woh Pune ke har visitor ko poore event se lauta dega, Halls A aur C samet. <b>Standard ACL</b> wahi bouncer hai: woh sirf <b>source</b> address dekhta hai. Yahi ek fact decide karta hai ki use kahan lagana hai.</p>

<h3>Standard ACL kya match kar sakta hai</h3>
<p>Standard IPv4 ACL packet ka <b>sirf source IP address</b> match karta hai (wildcard ke saath). Na destination, na protocol, na ports. Isse yeh simple aur fast hai, aur un kaamon ke liye perfect hai jahan asli sawaal hai "yeh kaun bhej raha hai?": NAT selection, VTY access control, route filtering aur simple "subnet X ko is LAN se door rakho" rules.</p>
<table class="cmp">
<tr><th>Type</th><th>Identifier</th><th>Kaise banta hai</th></tr>
<tr><td>Numbered standard</td><td>1 se 99, aur expanded range 1300 se 1999</td><td><code>access-list 10 permit ...</code></td></tr>
<tr><td>Named standard</td><td>Ek naam, jaise GUEST-BLOCK</td><td><code>ip access-list standard GUEST-BLOCK</code></td></tr>
</table>

<pre class="code"><span class="c">! Numbered standard ACL (global config)</span>
access-list 10 remark Block guest Wi-Fi from HR
access-list 10 deny   10.1.20.0 0.0.0.255
access-list 10 permit any
<span class="c">! Wahi policy named standard ACL ki tarah</span>
ip access-list standard GUEST-BLOCK
 remark Block guest Wi-Fi from HR
 deny   10.1.20.0 0.0.0.255
 permit any</pre>
<p>Named version aapko <code>(config-std-nacl)#</code> sub-mode mein le jaata hai, jahan har line ek entry hai. Chapter 8 dikhata hai ki named lists edit karna kyun aasaan hai.</p>

<h3>Placement rule: destination ke paas</h3>
<p>Kyunki standard ACL dekh nahi sakta ki packet kahan jaa raha hai, use source ke paas lagane se woh source us point ke aage <b>har cheez</b> se block ho jaata hai. Destination ke paas lagane se sirf us destination ki taraf jaane wala traffic affect hota hai. Isliye rule hai: <b>standard ACLs jitna ho sake destination ke paas jaate hain</b>, aam taur par protected LAN ki taraf wale interface par outbound.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Lab mein standard ACL placement">
<rect x="20" y="40" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">PC-A Sales</text><text x="75" y="74" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.10</text>
<rect x="20" y="180" width="110" height="40" rx="8" fill="#fed7aa"/><text x="75" y="198" text-anchor="middle" class="svg-ink" font-size="13">PC-B Guest</text><text x="75" y="214" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.10</text>
<rect x="190" y="110" width="90" height="44" rx="8" fill="#bae6fd"/><text x="235" y="137" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="360" y="110" width="90" height="44" rx="8" fill="#bae6fd"/><text x="405" y="137" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="520" y="110" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="570" y="130" text-anchor="middle" class="svg-ink" font-size="13">HR server</text><text x="570" y="146" text-anchor="middle" class="svg-muted" font-size="12">10.2.50.10</text>
<line x1="130" y1="60" x2="190" y2="125" stroke="#64748b" stroke-width="2"/><line x1="130" y1="200" x2="190" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="132" x2="360" y2="132" stroke="#64748b" stroke-width="2"/><line x1="450" y1="132" x2="520" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.0/30</text>
<circle cx="470" cy="132" r="9" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="100" text-anchor="middle" class="svg-accent" font-size="12">ACL 10 out, Gi0/0</text>
<circle cx="170" cy="158" r="9" fill="#fed7aa" stroke="#64748b"/><text x="190" y="250" text-anchor="middle" class="svg-muted" font-size="12">Yahan (R1 Gi0/2 in) guests ka WAN bhi jaata hai</text>
</svg><p class="cap">Lab acl-standard: sahi jagah R2 Gi0/0 outbound hai, HR ke bagal mein. Guests ke paas yeh zaroorat se zyada block karega.</p></div>

<h3>Lab walkthrough: acl-standard</h3>
<p>Lab kehta hai: guests (10.1.20.0/24) kabhi HR LAN (10.2.50.0/24) tak nahi pahunchne chahiye, par baaki sab use kar sakte hain, R2 ka WAN address 10.0.0.2 bhi. Sales (10.1.10.0/24) ka full access rahega. Candidate jagahein:</p>
<ul>
<li><b>R1 Gi0/2 inbound</b> (guests ke bagal mein): guest packets kahin jaane se pehle hi drop ho jaate hain. Guests ka WAN bhi chala jaata hai. Over-blocking.</li>
<li><b>R2 Gi0/1 inbound</b>: guests R2 ke apne 10.0.0.2 tak bhi nahi pahunch paate. Over-blocking.</li>
<li><b>R2 Gi0/0 outbound</b> (HR ke bagal mein): sirf HR LAN ki taraf nikalne wale packets check hote hain. Bilkul policy ke mutabik.</li>
</ul>
<pre class="code">R2(config)# access-list 10 remark Block guest Wi-Fi from HR
R2(config)# access-list 10 deny 10.1.20.0 0.0.0.255
R2(config)# access-list 10 permit any
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip access-group 10 out
R2(config-if)# end</pre>
<p>Ab PCs se test karo, phir counters padho:</p>
<pre class="out">PC-B&gt; ping 10.2.50.10
<span class="hl">*10.0.0.2 icmp_seq=1 ttl=255 time=9.8 ms (ICMP type:3, code:13, Communication administratively prohibited)</span>

R2# show access-lists
Standard IP access list 10
    10 deny   10.1.20.0, wildcard bits 0.0.0.255 <span class="hl">(5 matches)</span>
    20 permit any <span class="hl">(10 matches)</span>

R2# show ip interface GigabitEthernet0/0 | include access list
  Outgoing access list is <span class="hl">10</span>
  Inbound  access list is not set</pre>
<p>ICMP type 3 code 13 matlab "communication administratively prohibited": router sender ko bata raha hai ki ACL ne packet drop kiya. Sales ke HR pings line 20 badhate hain, guest pings line 10 badhate hain, aur 10.0.0.2 ki taraf guest pings ACL 10 ko chhute bhi nahi, kyunki woh Gi0/0 se bahar nahi jaate.</p>

<div class="eg"><p><b>Worked example: Gi0/0 par outbound kyun, inbound kyun nahi?</b> Guests se HR ka traffic R2 par Gi0/1 par <b>aata</b> hai aur Gi0/0 se <b>nikalta</b> hai. Gi0/0 par inbound ACL sirf HR servers <b>se</b> aane wale packets check karega, jahan source 10.2.50.x hai, kabhi 10.1.20.x nahi. Deny kabhi match nahi hoga. Hamesha poochho: is interface par, is direction mein, mujhe kaunse source addresses dikhenge?</p></div>

<div class="warn"><p><b>Common galti.</b> <code>permit any</code> bhool jaana. Sirf deny line ke saath, implicit deny Sales ko bhi block kar deta hai, aur ticket ban jaata hai "koi bhi HR tak nahi pahunch raha". Single-purpose standard ACL lagbhag hamesha permit par khatam hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ranges yaad rakho: standard 1 se 99 aur 1300 se 1999; extended 100 se 199 aur 2000 se 2699. Item <code>access-list 150 permit 10.1.1.0 0.0.0.255</code> dikhakar pooch sakta hai ki yeh reject kyun hua: 150 extended number hai, isliye IOS protocol keyword expect karta hai.</p></div>

<div class="scn"><h4>Guests ka internet chala gaya</h4><p>Ek hotel ke IT contractor ko guest VLAN ko property-management server tak pahunchne se rokne ko kaha gaya. Usne guest subnet deny karne wala standard ACL guest-facing sub-interface par inbound laga diya, guests ke paas. Kuch hi minutes mein front desk par complaints ki baadh aa gayi ki Wi-Fi mein "internet nahi hai". <code>show access-lists</code> ne har destination ke liye deny counter tezi se badhta dikhaya. Wahi ACL server VLAN interface par outbound shift karne se internet wapas aa gaya aur server protected raha.</p><p><b>Seekh:</b> source ke paas standard ACL source ko har cheez se block kar deta hai. Use us cheez ke bagal mein lagao jise protect kar rahe ho.</p></div>

<div class="iv"><p class="q">"Standard ACL kahan lagate ho aur kyun?"</p><p>Strong answer: jitna ho sake destination ke paas, kyunki standard ACL sirf source address match karta hai; source ke paas woh us source ko har destination se block kar dega. Example do: HR LAN ki taraf wale router interface par guest subnet outbound deny, uske baad permit any. Batao ki modern best practice aksar source ke paas extended ACL hai, jo exact ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Standard ACLs sirf source IPv4 address match karte hain.</li>
<li>Numbered ranges: 1 se 99 aur 1300 se 1999; named wale <code>ip access-list standard NAME</code> use karte hain.</li>
<li>Standard ACLs destination ke paas lagao, aam taur par protected LAN ki taraf outbound.</li>
<li>"X block karo" list ko <code>permit any</code> se khatam karo, warna implicit deny sabko block kar deta hai.</li>
<li>Jab ACL packet drop karta hai to PC "administratively prohibited" (ICMP 3/13) dekhta hai.</li>
</ul></div>
`}};export{e as default};