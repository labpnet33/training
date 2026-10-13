var e={id:`inspection-source-guard`,h:{en:`ND inspection, IPv6 source guard, prefix guard and destination guard`,hi:`ND inspection, IPv6 source guard, prefix guard aur destination guard`},body:{en:`
<p>At an airport, one officer checks your boarding pass against the passenger list at the gate (is this message consistent and does this person own the seat?). Another officer at the aircraft door checks every person who actually walks in (does this body match a valid boarding pass?). A third rule stops the crew from looking for passengers who were never booked. IPv6 FHS has the same three layers: <b>ND inspection</b> checks control messages, <b>source guard</b> checks every data packet, and <b>destination guard</b> stops the router from chasing addresses nobody owns.</p>

<h3>ND inspection: validating NDP messages</h3>
<p>ND inspection analyses NS and NA messages on the port, learns bindings from them, and drops messages that are inconsistent or that try to claim an address owned by someone else. On older IOS it is a separate feature; on IOS XE it is <code>security-level inspect</code> in a device-tracking policy.</p>
<pre class="code"><span class="c">! Older IOS syntax</span>
ipv6 nd inspection policy NDI-EDGE
 device-role host
 validate source-mac              <span class="c">! link-layer option must equal the frame's source MAC</span>
 limit address-count 10
 tracking enable
interface range GigabitEthernet0/1 - 3
 ipv6 nd inspection attach-policy NDI-EDGE
!
<span class="c">! IOS XE equivalent</span>
device-tracking policy EDGE-INSPECT
 security-level inspect
 limit address-count 10
 tracking enable</pre>
<dl class="terms">
<dt>validate source-mac</dt><dd>An NS or NA whose Source/Target Link-Layer Address option does not match the Ethernet source MAC is dropped. A spoofer who sends from his real MAC but advertises the gateway's MAC in the option is caught.</dd>
<dt>drop-unsecure / sec-level minimum</dt><dd>For SEND deployments only: drop NDP without valid CGA/RSA options, or below a minimum security level.</dd>
<dt>limit address-count</dt><dd>Caps how many addresses one port may own.</dd>
</dl>

<h3>IPv6 source guard: validating data packets</h3>
<p>Snooping and ND inspection protect the <b>control plane</b>. A host can still ignore NDP entirely and just send data packets with a stolen source address. <b>IPv6 source guard</b> protects the <b>data plane</b>: every IPv6 packet entering the port must carry a source address that the binding table ties to <b>that port and that MAC</b>. Anything else is dropped in hardware.</p>
<pre class="code"><span class="c">! Lab 3: snooping first, then source guard on the same ports</span>
ipv6 snooping policy EDGE-SNOOP
 security-level guard
 tracking enable
ipv6 source-guard policy EDGE-SG
<span class="c">!  options: permit link-local | deny global-autoconf | validate prefix | trusted</span>
interface range GigabitEthernet0/1 - 3
 ipv6 snooping attach-policy EDGE-SNOOP
 ipv6 source-guard attach-policy EDGE-SG</pre>
<dl class="terms">
<dt>Dependency</dt><dd>Source guard has no table of its own. Without a snooping/device-tracking policy on the port (or VLAN), it has nothing to permit and legitimate hosts are dropped.</dd>
<dt>permit link-local</dt><dd>Allows all data sourced from link-local addresses without a binding.</dd>
<dt>deny global-autoconf</dt><dd>Drops data from SLAAC-built global addresses; use in networks where every global address must come from DHCPv6.</dd>
<dt>Silent hosts</dt><dd>A host must appear in the table before it can send. On IOS XE, <code>data-glean</code> in the device-tracking policy lets the switch verify an unknown source with a probe and learn it instead of dropping it forever.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Source guard decision">
<rect x="20" y="20" width="200" height="54" rx="8" fill="#fde68a"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="12">Data packet on Gi0/3</text><text x="120" y="60" text-anchor="middle" class="svg-muted" font-size="12">src 2001:db8:a30::12</text>
<rect x="250" y="20" width="200" height="54" rx="8" fill="#ddd6fe"/><text x="350" y="42" text-anchor="middle" class="svg-ink" font-size="12">Binding table lookup</text><text x="350" y="60" text-anchor="middle" class="svg-muted" font-size="12">::12 = Gi0/2, MAC ...6802</text>
<line x1="220" y1="47" x2="250" y2="47" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="54" rx="8" fill="#fed7aa"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="12">Port/MAC differ</text><text x="545" y="60" text-anchor="middle" class="svg-accent" font-size="12">DROP</text>
<line x1="450" y1="47" x2="470" y2="47" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="150" width="200" height="54" rx="8" fill="#bbf7d0"/><text x="120" y="172" text-anchor="middle" class="svg-ink" font-size="12">Data packet on Gi0/3</text><text x="120" y="190" text-anchor="middle" class="svg-muted" font-size="12">src 2001:db8:a30::13</text>
<rect x="250" y="150" width="200" height="54" rx="8" fill="#ddd6fe"/><text x="350" y="172" text-anchor="middle" class="svg-ink" font-size="12">Binding table lookup</text><text x="350" y="190" text-anchor="middle" class="svg-muted" font-size="12">::13 = Gi0/3, MAC ...6803</text>
<line x1="220" y1="177" x2="250" y2="177" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="150" width="150" height="54" rx="8" fill="#bbf7d0"/><text x="545" y="172" text-anchor="middle" class="svg-ink" font-size="12">Port and MAC match</text><text x="545" y="190" text-anchor="middle" class="svg-accent" font-size="12">FORWARD</text>
<line x1="450" y1="177" x2="470" y2="177" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 3: the same port, two source addresses. Only the address bound to Gi0/3 and PC3's MAC may leave that port.</p></div>

<h3>Verifying source guard in lab 3</h3>
<pre class="out">%SISF-4-IP_THEFT: IP theft IP=2001:DB8:A30::12 VLAN=30 MAC=0050.7966.6803 I/F=Gi0/3 already bound on I/F=Gi0/2 MAC=0050.7966.6802
%SISF-4-PAK_DROP: Message dropped A: 2001:DB8:A30::12 P: [IPv6::DATA] M: 0050.7966.6803 V: 30 I: Gi0/3 Reason: Source address is bound to another port

SW1# show ipv6 snooping counters interface g0/3
Received messages on Gi0/3:
  NDP      RS[0] RA[0] NS[3] NA[0] REDIR[0]
  DHCPv6   CLIENT[0] SERVER[0]
  Data     IPv6[9]
Dropped messages on Gi0/3:
  NDP      RS[0] RA[0] NS[1] NA[0] REDIR[0]
  DHCPv6   CLIENT[0] SERVER[0]
  Data     IPv6[5]
<span class="hl">  Drops by feature: RA guard[0] DHCP guard[0] Snooping[1] Source guard[5]</span></pre>
<p>Read it as a story: snooping refused PC3's NS claiming ::12 (1 drop, IP_THEFT), and source guard dropped five data packets sourced from ::12 on Gi0/3. PC2 on Gi0/2 keeps working, and when PC3 returns to ::13, its packets pass again.</p>

<h3>Prefix guard</h3>
<p>Sometimes a port legitimately sources many addresses from a whole prefix, for example a customer router that received a <b>delegated prefix</b> via DHCPv6-PD, with hundreds of devices behind it. Binding every address is impossible. <b>Prefix guard</b> (<code>validate prefix</code> in the source-guard policy) permits any source inside a prefix learned for that port (from DHCPv6-PD, from RAs with <code>prefix-glean</code> in the snooping policy, or from a static prefix binding) and drops sources outside it. It is common in service-provider access networks.</p>
<pre class="code">ipv6 snooping policy CPE-SNOOP
 prefix-glean
ipv6 source-guard policy CPE-PG
 validate prefix
interface GigabitEthernet0/10
 ipv6 snooping attach-policy CPE-SNOOP
 ipv6 source-guard attach-policy CPE-PG</pre>

<h3>Destination guard (concept)</h3>
<p>Destination guard runs where the switch is also the first-hop router. For traffic arriving towards the VLAN, it only allows address resolution for destinations present in the binding table. A remote scan of 2001:db8:a30::/64 no longer creates millions of INCOMPLETE neighbour entries. With <code>enforcement always</code> it applies all the time; with <code>enforcement stressed</code> only when the device is under load.</p>
<pre class="code">ipv6 destination-guard policy DST-G
 enforcement always
vlan configuration 30
 ipv6 destination-guard attach-policy DST-G</pre>

<div class="eg"><p><b>Worked example.</b> A /64 has 2 to the power 64 addresses; a scanner sending 10,000 packets per second to random addresses would make an unprotected router start 10,000 resolutions per second. With destination guard and 120 bound hosts, only packets to those 120 addresses trigger resolution; the rest are dropped at once.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling source guard before the binding table is populated, or on ports with silent servers. The result is an outage that looks like a cabling fault. Roll out snooping, check the table, add static bindings, then enable source guard.</p></div>

<div class="exam"><p><b>Exam trap.</b> Source guard needs the binding table, so it <b>always</b> needs snooping/device-tracking on the same port or VLAN. Prefix guard permits whole prefixes; source guard permits individual addresses. Destination guard protects the <b>router's</b> neighbour cache, not a host.</p></div>

<div class="scn"><h4>The ACL that someone walked around</h4><p>A finance application only accepted connections from 2001:db8:a30::12 (the finance manager's PC). An audit found connections from that address while the manager was on leave. The access switch had no FHS. The team enabled IPv6 snooping and source guard on the finance VLAN. Two days later the syslog showed <code>%SISF-4-IP_THEFT</code> for ::12 on a port three desks away, and the source-guard drop counter on that port rose. The spoofed traffic never reached the application again.</p><p><b>Lesson:</b> an address-based ACL is only as strong as the proof that the address is genuine. Source guard provides that proof at the edge.</p></div>

<div class="iv"><p class="q">"What is the difference between ND inspection, IPv6 source guard and prefix guard?"</p><p>ND inspection validates NDP control messages, checking consistency such as the link-layer option against the source MAC and preventing claims on addresses bound elsewhere. Source guard validates data packets: the source must be bound to that port and MAC in the binding table. Prefix guard is source guard for whole prefixes, used where a port owns a delegated prefix. All three depend on the SISF binding table.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ND inspection (IOS XE: security-level inspect) validates NS/NA, for example validate source-mac.</li>
<li>IPv6 source guard drops data whose source is not bound to that port and MAC.</li>
<li>Source guard depends on snooping/device-tracking; populate the table before enforcing.</li>
<li>Prefix guard (validate prefix) permits sources inside a learned or delegated prefix.</li>
<li>Destination guard stops remote scans from filling the router's neighbour cache.</li>
</ul></div>
`,hi:`
<p>Airport par ek officer gate par aapka boarding pass passenger list se milata hai (kya yeh message consistent hai aur kya yeh insaan seat ka maalik hai?). Doosra officer aircraft ke darwaze par har us insaan ko check karta hai jo asal mein andar aata hai (kya yeh vyakti valid boarding pass se match karta hai?). Teesra rule crew ko un passengers ko dhoondhne se rokta hai jo kabhi book hi nahi hue. IPv6 FHS mein bhi yahi teen layers hain: <b>ND inspection</b> control messages check karta hai, <b>source guard</b> har data packet check karta hai, aur <b>destination guard</b> router ko un addresses ke peeche bhaagne se rokta hai jinka koi maalik nahi.</p>

<h3>ND inspection: NDP messages validate karna</h3>
<p>ND inspection port par NS aur NA messages analyse karta hai, unse bindings seekhta hai, aur un messages ko drop karta hai jo inconsistent hain ya kisi aur ke address ko claim karte hain. Purane IOS par yeh alag feature hai; IOS XE par yeh device-tracking policy mein <code>security-level inspect</code> hai.</p>
<pre class="code"><span class="c">! Purana IOS syntax</span>
ipv6 nd inspection policy NDI-EDGE
 device-role host
 validate source-mac              <span class="c">! link-layer option frame ke source MAC ke barabar ho</span>
 limit address-count 10
 tracking enable
interface range GigabitEthernet0/1 - 3
 ipv6 nd inspection attach-policy NDI-EDGE
!
<span class="c">! IOS XE equivalent</span>
device-tracking policy EDGE-INSPECT
 security-level inspect
 limit address-count 10
 tracking enable</pre>
<dl class="terms">
<dt>validate source-mac</dt><dd>Jis NS ya NA ka Source/Target Link-Layer Address option Ethernet source MAC se match na kare, woh drop hota hai. Jo spoofer apne asli MAC se bhejta hai par option mein gateway ka MAC advertise karta hai, woh pakda jaata hai.</dd>
<dt>drop-unsecure / sec-level minimum</dt><dd>Sirf SEND deployments ke liye: valid CGA/RSA options ke bina, ya minimum security level se neeche wala NDP drop karo.</dd>
<dt>limit address-count</dt><dd>Ek port kitne addresses ka maalik ho sakta hai, iski seema.</dd>
</dl>

<h3>IPv6 source guard: data packets validate karna</h3>
<p>Snooping aur ND inspection <b>control plane</b> ko bachate hain. Host phir bhi NDP ko poori tarah ignore karke chori ke source address se data packets bhej sakta hai. <b>IPv6 source guard</b> <b>data plane</b> ko bachata hai: port mein aane wale har IPv6 packet ka source address aisa hona chahiye jise binding table <b>usi port aur usi MAC</b> se jodti ho. Baaki sab hardware mein drop hota hai.</p>
<pre class="code"><span class="c">! Lab 3: pehle snooping, phir same ports par source guard</span>
ipv6 snooping policy EDGE-SNOOP
 security-level guard
 tracking enable
ipv6 source-guard policy EDGE-SG
<span class="c">!  options: permit link-local | deny global-autoconf | validate prefix | trusted</span>
interface range GigabitEthernet0/1 - 3
 ipv6 snooping attach-policy EDGE-SNOOP
 ipv6 source-guard attach-policy EDGE-SG</pre>
<dl class="terms">
<dt>Dependency</dt><dd>Source guard ki apni koi table nahi hai. Port (ya VLAN) par snooping/device-tracking policy ke bina uske paas permit karne ko kuch nahi hota aur sahi hosts drop ho jaate hain.</dd>
<dt>permit link-local</dt><dd>Link-local addresses se aane wala saara data bina binding ke allow karta hai.</dd>
<dt>deny global-autoconf</dt><dd>SLAAC se bane global addresses ka data drop karta hai; un networks mein use karo jahan har global address DHCPv6 se aana chahiye.</dd>
<dt>Silent hosts</dt><dd>Host bhejne se pehle table mein dikhna chahiye. IOS XE par device-tracking policy mein <code>data-glean</code> switch ko anjaan source ko probe se verify karke seekhne deta hai, hamesha drop karne ke bajaye.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Source guard decision">
<rect x="20" y="20" width="200" height="54" rx="8" fill="#fde68a"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="12">Gi0/3 par data packet</text><text x="120" y="60" text-anchor="middle" class="svg-muted" font-size="12">src 2001:db8:a30::12</text>
<rect x="250" y="20" width="200" height="54" rx="8" fill="#ddd6fe"/><text x="350" y="42" text-anchor="middle" class="svg-ink" font-size="12">Binding table lookup</text><text x="350" y="60" text-anchor="middle" class="svg-muted" font-size="12">::12 = Gi0/2, MAC ...6802</text>
<line x1="220" y1="47" x2="250" y2="47" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="54" rx="8" fill="#fed7aa"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="12">Port/MAC alag</text><text x="545" y="60" text-anchor="middle" class="svg-accent" font-size="12">DROP</text>
<line x1="450" y1="47" x2="470" y2="47" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="150" width="200" height="54" rx="8" fill="#bbf7d0"/><text x="120" y="172" text-anchor="middle" class="svg-ink" font-size="12">Gi0/3 par data packet</text><text x="120" y="190" text-anchor="middle" class="svg-muted" font-size="12">src 2001:db8:a30::13</text>
<rect x="250" y="150" width="200" height="54" rx="8" fill="#ddd6fe"/><text x="350" y="172" text-anchor="middle" class="svg-ink" font-size="12">Binding table lookup</text><text x="350" y="190" text-anchor="middle" class="svg-muted" font-size="12">::13 = Gi0/3, MAC ...6803</text>
<line x1="220" y1="177" x2="250" y2="177" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="150" width="150" height="54" rx="8" fill="#bbf7d0"/><text x="545" y="172" text-anchor="middle" class="svg-ink" font-size="12">Port aur MAC match</text><text x="545" y="190" text-anchor="middle" class="svg-accent" font-size="12">FORWARD</text>
<line x1="450" y1="177" x2="470" y2="177" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 3: ek hi port, do source addresses. Sirf Gi0/3 aur PC3 ke MAC se bound address hi us port se bahar ja sakta hai.</p></div>

<h3>Lab 3 mein source guard verify karna</h3>
<pre class="out">%SISF-4-IP_THEFT: IP theft IP=2001:DB8:A30::12 VLAN=30 MAC=0050.7966.6803 I/F=Gi0/3 already bound on I/F=Gi0/2 MAC=0050.7966.6802
%SISF-4-PAK_DROP: Message dropped A: 2001:DB8:A30::12 P: [IPv6::DATA] M: 0050.7966.6803 V: 30 I: Gi0/3 Reason: Source address is bound to another port

SW1# show ipv6 snooping counters interface g0/3
Received messages on Gi0/3:
  NDP      RS[0] RA[0] NS[3] NA[0] REDIR[0]
  DHCPv6   CLIENT[0] SERVER[0]
  Data     IPv6[9]
Dropped messages on Gi0/3:
  NDP      RS[0] RA[0] NS[1] NA[0] REDIR[0]
  DHCPv6   CLIENT[0] SERVER[0]
  Data     IPv6[5]
<span class="hl">  Drops by feature: RA guard[0] DHCP guard[0] Snooping[1] Source guard[5]</span></pre>
<p>Ise kahani ki tarah padho: snooping ne ::12 claim karne wala PC3 ka NS thukraya (1 drop, IP_THEFT), aur source guard ne Gi0/3 par ::12 se aaye paanch data packets drop kiye. Gi0/2 par PC2 chalta rehta hai, aur jab PC3 ::13 par wapas aata hai, uske packets phir se jaate hain.</p>

<h3>Prefix guard</h3>
<p>Kabhi kabhi ek port jaayaz taur par poore prefix ke bahut saare addresses source karta hai, jaise ek customer router jise DHCPv6-PD se <b>delegated prefix</b> mila hai, aur uske peeche sainkdon devices hain. Har address bind karna namumkin hai. <b>Prefix guard</b> (source-guard policy mein <code>validate prefix</code>) us port ke liye seekhe prefix ke andar ka koi bhi source allow karta hai (DHCPv6-PD se, snooping policy mein <code>prefix-glean</code> ke saath RAs se, ya static prefix binding se) aur bahar wale sources drop karta hai. Yeh service-provider access networks mein common hai.</p>
<pre class="code">ipv6 snooping policy CPE-SNOOP
 prefix-glean
ipv6 source-guard policy CPE-PG
 validate prefix
interface GigabitEthernet0/10
 ipv6 snooping attach-policy CPE-SNOOP
 ipv6 source-guard attach-policy CPE-PG</pre>

<h3>Destination guard (concept)</h3>
<p>Destination guard wahan chalta hai jahan switch first-hop router bhi hai. VLAN ki taraf aane wale traffic ke liye yeh sirf binding table mein maujood destinations ka address resolution allow karta hai. 2001:db8:a30::/64 ka remote scan ab lakhon INCOMPLETE neighbour entries nahi banata. <code>enforcement always</code> ke saath yeh hamesha laagu hota hai; <code>enforcement stressed</code> ke saath sirf tab jab device load mein ho.</p>
<pre class="code">ipv6 destination-guard policy DST-G
 enforcement always
vlan configuration 30
 ipv6 destination-guard attach-policy DST-G</pre>

<div class="eg"><p><b>Worked example.</b> Ek /64 mein 2 ki power 64 addresses hote hain; random addresses par 10,000 packets per second bhejne wala scanner bina protection wale router se har second 10,000 resolutions shuru karwa dega. Destination guard aur 120 bound hosts ke saath, sirf un 120 addresses ke packets resolution trigger karte hain; baaki turant drop hote hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Binding table bharne se pehle, ya silent servers wale ports par, source guard on karna. Nateeja ek outage hota hai jo cabling fault jaisa dikhta hai. Snooping roll out karo, table check karo, static bindings jodo, phir source guard on karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Source guard ko binding table chahiye, isliye use same port ya VLAN par <b>hamesha</b> snooping/device-tracking chahiye. Prefix guard poore prefixes permit karta hai; source guard individual addresses. Destination guard <b>router</b> ki neighbour cache ko bachata hai, host ko nahi.</p></div>

<div class="scn"><h4>ACL jiske aas-paas se koi nikal gaya</h4><p>Ek finance application sirf 2001:db8:a30::12 (finance manager ka PC) se connections accept karti thi. Audit mein us address se connections mile jab manager chhutti par thi. Access switch par koi FHS nahi tha. Team ne finance VLAN par IPv6 snooping aur source guard enable kiya. Do din baad syslog ne teen desk door ke ek port par ::12 ke liye <code>%SISF-4-IP_THEFT</code> dikhaya, aur us port ka source-guard drop counter badha. Spoofed traffic phir kabhi application tak nahi pahuncha.</p><p><b>Seekh:</b> address-based ACL utna hi mazboot hai jitna yeh saboot ki address asli hai. Source guard edge par woh saboot deta hai.</p></div>

<div class="iv"><p class="q">"ND inspection, IPv6 source guard aur prefix guard mein kya fark hai?"</p><p>ND inspection NDP control messages validate karta hai, consistency check karta hai jaise link-layer option ko source MAC se milana, aur kahin aur bound addresses ke claims rokta hai. Source guard data packets validate karta hai: source binding table mein usi port aur MAC se bound hona chahiye. Prefix guard poore prefixes ke liye source guard hai, wahan use hota hai jahan port ek delegated prefix ka maalik ho. Teeno SISF binding table par depend karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ND inspection (IOS XE: security-level inspect) NS/NA validate karta hai, jaise validate source-mac.</li>
<li>IPv6 source guard woh data drop karta hai jiska source us port aur MAC se bound nahi.</li>
<li>Source guard snooping/device-tracking par depend karta hai; enforce karne se pehle table bharo.</li>
<li>Prefix guard (validate prefix) seekhe ya delegated prefix ke andar ke sources allow karta hai.</li>
<li>Destination guard remote scans ko router ki neighbour cache bharne se rokta hai.</li>
</ul></div>
`}};export{e as default};