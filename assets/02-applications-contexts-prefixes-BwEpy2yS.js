var e={id:`apps-contexts-prefixes`,h:{en:`Applications, transfer types, network contexts and prefix filters`,hi:`Applications, transfer types, network contexts aur prefix filters`},body:{en:`
<p>Before a rule can say "voice goes over MPLS", the ION must know what is voice, who is sending it and where it goes. Prisma SD-WAN gives you four matching tools: <b>applications</b>, <b>network contexts</b>, <b>prefix filters</b> and, in newer designs, users and device profiles. This chapter explains them, because every path, QoS and performance rule is built from them.</p>
<h3>Analogy: sorting the post</h3>
<p>A post office sorts parcels by what is inside (fragile, urgent, bulk), who sent them (a bank, a school) and where they go (city, village). The sorting labels are applications, network contexts and prefixes. Without clear labels, even the best delivery rules cannot work.</p>
<h3>Applications and app-defs</h3>
<p>An <b>application definition (app-def)</b> tells the ION how to recognise a type of traffic. The ION has a library of system applications that it identifies at ingress, and you can add <b>custom applications</b>. The documentation describes two kinds of custom app-defs:</p>
<table class="cmp"><tr><th>Kind</th><th>Identified by</th><th>Fields mentioned in the documentation</th></tr>
<tr><td><b>Layer 3/4 application</b></td><td>Network characteristics, not content</td><td>Display name and abbreviation; port numbers; optional DSCP (0 to 63); optional server prefix filters; UDP, TCP and IP rules (IP rules cover protocols such as GRE and ICMP)</td></tr>
<tr><td><b>Layer 7 application</b></td><td>Domain names and URL patterns</td><td>Domain names (case-sensitive, up to 16 entries); application category; transfer type; ingress traffic percentage; connection idle timeout; path affinity (Strict or None)</td></tr></table>
<p>There is also a documented feature called <b>system application overrides</b>, which lets you change how a built-in application is treated. Use custom app-defs for in-house applications that the library cannot recognise, such as the Harbor Foods warehouse system running on TCP 8443 at 10.20.40.10 (a private example address).</p>
<h3>Transfer types</h3>
<p>Every application has a <b>transfer type</b>, which tells the ION what kind of traffic it is and so how to queue and treat it. The four types in the documentation are <b>real-time audio, real-time video, transactional and bulk</b>. Inside each priority class, the queue servicing order follows that same sequence: real-time audio first, then real-time video, then transactional, then bulk. Performance rules can also match on transfer type.</p>
<ul>
<li><b>Real-time audio:</b> voice calls. Needs low jitter and low loss.</li>
<li><b>Real-time video:</b> video meetings. Needs bandwidth and low jitter.</li>
<li><b>Transactional:</b> request and response such as ERP, payments, web apps.</li>
<li><b>Bulk:</b> backups, software updates, large file transfers. Tolerates delay.</li>
</ul>
<h3>Network contexts</h3>
<p>A <b>network context</b> segments traffic so that the same application can be treated differently for different user communities. The documentation gives the example logic: rules for the same application can differ across contexts. In the QoS rule precedence the network context is the highest ranked matching element, ahead of source prefix, application and destination prefix. A common design: contexts named CORP, PAYMENT and GUEST that line up with the zones and segments from the design module.</p>
<h3>Prefix filters: global and local</h3>
<p>A <b>prefix filter</b> is a named group of IP prefixes in CIDR form. The documentation defines two kinds:</p>
<table class="cmp"><tr><th>Kind</th><th>Meaning</th><th>Example use</th></tr>
<tr><td><b>Global prefix</b></td><td>Same set of prefixes at every site</td><td>The data center server range 10.20.0.0/16, a print service range</td></tr>
<tr><td><b>Local prefix</b></td><td>Values differ by branch; one rule works everywhere</td><td>"This site's payment VLAN", with 10.110.30.0/24 at STORE-007 and 10.111.30.0/24 at STORE-008</td></tr></table>
<p>When you create a prefix you choose the policy types it is for (Path, QoS, and for the security variant NGFW security and optionally NAT). Local prefixes must be attached to sites to become operational, and IPv6 prefixes are supported. For security, the documentation warns that very large prefix lists can exhaust ION memory and cause out-of-memory failures, so summarise instead of listing hundreds of /32s.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Matching elements of a rule">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="13">Network context</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="11">CORP / PAYMENT</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">Source prefix</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">local: site VLAN</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="11">system or custom</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Destination prefix</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">global: DC range</text>
<rect x="10" y="120" width="620" height="70" rx="10" fill="#e2e8f0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">Rule match = combination of the elements above</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="11">QoS precedence: context, then source prefix, application, destination prefix</text>
</svg><p class="cap">The four matching elements shared by path, QoS and performance rules.</p></div>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>The documentation places custom application definitions and prefixes under the stacked policies area of the portal (Configuration, Prisma SD-WAN, Policies). In the design phase you only prepare a catalogue: for each in-house application list its name, ports or domains, transfer type and criticality; for each segment list its context name and prefix kind. Then rules can be written quickly and consistently.</p>
<div class="eg"><p><b>Worked example: Harbor Foods catalogue.</b></p>
<table class="cmp"><tr><th>Application</th><th>Type</th><th>Transfer type</th><th>Priority intent</th></tr>
<tr><td>Voice (SIP and RTP)</td><td>System</td><td>Real-time audio</td><td>Platinum</td></tr>
<tr><td>Video meetings</td><td>System</td><td>Real-time video</td><td>Gold</td></tr>
<tr><td>Card payments (payment gateway)</td><td>Custom L3/4 or L7</td><td>Transactional</td><td>Platinum</td></tr>
<tr><td>ERP at 10.20.40.10</td><td>Custom L3/4, TCP 8443</td><td>Transactional</td><td>Silver</td></tr>
<tr><td>Nightly backup</td><td>Custom</td><td>Bulk</td><td>Bronze</td></tr></table></div>
<div class="warn"><p><b>Common mistakes.</b> Defining a custom application too broadly (all of TCP 443 becomes your application and hides SaaS). Using local prefixes but forgetting to attach them to sites, so the rule matches nothing. Giving every application a high priority. Putting hundreds of host prefixes into a security prefix list.</p></div>
<div class="exam"><p><b>Exam trap.</b> Four transfer types: real-time audio, real-time video, transactional, bulk. Layer 3/4 apps are identified by ports and prefixes; Layer 7 apps by domain names (up to 16, case-sensitive). Global prefixes are identical everywhere; local prefixes vary by site and must be attached to sites.</p></div>
<div class="scn"><h4>The rule that matched nothing</h4><p>A new path rule for the payment VLAN used a local prefix named PAY-LAN. Everything looked right, yet payment traffic still used the default path at all stores. The local prefix had been created but never attached to the sites, so it was empty at runtime. Attaching it to the 40 stores made the rule match.</p><p><b>Lesson:</b> a local prefix is only a name until it is given values per site.</p></div>
<div class="iv"><p class="q">"What is the difference between a global and a local prefix, and why use local ones?"</p><p>A global prefix has the same IP ranges at every site; a local prefix has values that differ per branch. Local prefixes let one rule such as "this site's payment network" work across all branches instead of 40 near-identical rules. They must be attached to the sites to work.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>App-defs identify traffic; custom apps can be Layer 3/4 (ports) or Layer 7 (domains).</li>
<li>Transfer types: real-time audio, real-time video, transactional, bulk; they drive queueing.</li>
<li>Network contexts segment the same application for different communities.</li>
<li>Prefix filters are global (same everywhere) or local (per site, must be attached).</li>
<li>Prepare an application and segment catalogue before writing rules.</li>
</ul></div>
`,hi:`
<p>Rule kehne se pehle ki "voice MPLS par jaaye", ION ko pata hona chahiye ki voice kya hai, kaun bhej raha hai aur kahan ja rahi hai. Prisma SD-WAN aapko chaar matching tools deta hai: <b>applications</b>, <b>network contexts</b>, <b>prefix filters</b> aur naye designs mein users aur device profiles. Yeh chapter unhe samjhata hai, kyunki har path, QoS aur performance rule unhi se bana hota hai.</p>
<h3>Analogy: dak ki sorting</h3>
<p>Post office parcels ko is hisaab se sort karta hai ki andar kya hai (fragile, urgent, bulk), kisne bheja (bank, school) aur kahan ja raha hai (shehar, gaon). Sorting labels applications, network contexts aur prefixes hain. Saaf labels ke bina best delivery rules bhi kaam nahi kar sakte.</p>
<h3>Applications aur app-defs</h3>
<p><b>Application definition (app-def)</b> ION ko batati hai ki traffic ke type ko kaise pehchanna hai. ION ke paas system applications ki library hai jo woh ingress par identify karta hai, aur aap <b>custom applications</b> add kar sakte ho. Documentation custom app-defs ki do kisme batati hai:</p>
<table class="cmp"><tr><th>Kind</th><th>Kis se identify hota hai</th><th>Documentation mein diye fields</th></tr>
<tr><td><b>Layer 3/4 application</b></td><td>Network characteristics, content nahi</td><td>Display name aur abbreviation; port numbers; optional DSCP (0 se 63); optional server prefix filters; UDP, TCP aur IP rules (IP rules mein GRE aur ICMP jaise protocols aate hain)</td></tr>
<tr><td><b>Layer 7 application</b></td><td>Domain names aur URL patterns</td><td>Domain names (case-sensitive, 16 entries tak); application category; transfer type; ingress traffic percentage; connection idle timeout; path affinity (Strict ya None)</td></tr></table>
<p>Ek documented feature <b>system application overrides</b> bhi hai, jo built-in application ke treatment ko badalne deta hai. Custom app-defs un in-house applications ke liye use karo jinhe library pehchan nahi sakti, jaise Harbor Foods ka warehouse system jo 10.20.40.10 (private example address) par TCP 8443 par chalta hai.</p>
<h3>Transfer types</h3>
<p>Har application ka ek <b>transfer type</b> hota hai, jo ION ko batata hai ki traffic kis kism ka hai aur isliye use kaise queue aur treat karna hai. Documentation ke chaar types hain: <b>real-time audio, real-time video, transactional aur bulk</b>. Har priority class ke andar queue servicing order wahi sequence follow karta hai: pehle real-time audio, phir real-time video, phir transactional, phir bulk. Performance rules transfer type par bhi match kar sakte hain.</p>
<ul>
<li><b>Real-time audio:</b> voice calls. Kam jitter aur kam loss chahiye.</li>
<li><b>Real-time video:</b> video meetings. Bandwidth aur kam jitter chahiye.</li>
<li><b>Transactional:</b> request aur response, jaise ERP, payments, web apps.</li>
<li><b>Bulk:</b> backups, software updates, bade file transfers. Delay sah leta hai.</li>
</ul>
<h3>Network contexts</h3>
<p><b>Network context</b> traffic ko segment karta hai taaki ek hi application ko alag user communities ke liye alag treat kiya ja sake. QoS rule precedence mein network context sabse upar ka matching element hai, source prefix, application aur destination prefix se aage. Common design: CORP, PAYMENT aur GUEST naam ke contexts jo design module ke zones aur segments se match karte hain.</p>
<h3>Prefix filters: global aur local</h3>
<p><b>Prefix filter</b> CIDR form mein IP prefixes ka naam wala group hai. Documentation do kisme define karti hai:</p>
<table class="cmp"><tr><th>Kind</th><th>Matlab</th><th>Example use</th></tr>
<tr><td><b>Global prefix</b></td><td>Har site par same prefixes ka set</td><td>Data center server range 10.20.0.0/16, print service range</td></tr>
<tr><td><b>Local prefix</b></td><td>Values branch ke hisaab se alag; ek rule har jagah kaam karta hai</td><td>"Is site ka payment VLAN", STORE-007 par 10.110.30.0/24 aur STORE-008 par 10.111.30.0/24</td></tr></table>
<p>Prefix banate waqt aap policy types chunte ho jinke liye woh hai (Path, QoS, aur security variant ke liye NGFW security aur optional NAT). Local prefixes ko operational hone ke liye sites se attach karna padta hai, aur IPv6 prefixes supported hain. Security ke liye documentation chetavani deti hai ki bahut bade prefix lists ION memory khatam karke out-of-memory failures la sakte hain, isliye sainkdon /32 likhne ki jagah summarise karo.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Matching elements of a rule">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="13">Network context</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="11">CORP / PAYMENT</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">Source prefix</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">local: site VLAN</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="11">system ya custom</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Destination prefix</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">global: DC range</text>
<rect x="10" y="120" width="620" height="70" rx="10" fill="#e2e8f0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">Rule match = upar ke elements ka combination</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="11">QoS precedence: context, phir source prefix, application, destination prefix</text>
</svg><p class="cap">Path, QoS aur performance rules ke chaar shared matching elements.</p></div>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>Documentation custom application definitions aur prefixes ko portal ke stacked policies area (Configuration, Prisma SD-WAN, Policies) ke under rakhti hai. Design phase mein aap sirf ek catalogue taiyar karte ho: har in-house application ke liye naam, ports ya domains, transfer type aur criticality likho; har segment ke liye context name aur prefix kind likho. Phir rules tezi se aur consistent likhe ja sakte hain.</p>
<div class="eg"><p><b>Worked example: Harbor Foods catalogue.</b></p>
<table class="cmp"><tr><th>Application</th><th>Type</th><th>Transfer type</th><th>Priority intent</th></tr>
<tr><td>Voice (SIP aur RTP)</td><td>System</td><td>Real-time audio</td><td>Platinum</td></tr>
<tr><td>Video meetings</td><td>System</td><td>Real-time video</td><td>Gold</td></tr>
<tr><td>Card payments (payment gateway)</td><td>Custom L3/4 ya L7</td><td>Transactional</td><td>Platinum</td></tr>
<tr><td>10.20.40.10 par ERP</td><td>Custom L3/4, TCP 8443</td><td>Transactional</td><td>Silver</td></tr>
<tr><td>Nightly backup</td><td>Custom</td><td>Bulk</td><td>Bronze</td></tr></table></div>
<div class="warn"><p><b>Common galtiyan.</b> Custom application bahut broad define karna (poora TCP 443 aapki application ban jaata hai aur SaaS chhup jaata hai). Local prefixes use karna par sites se attach karna bhool jaana, jisse rule kuch match nahi karta. Har application ko high priority dena. Security prefix list mein sainkdon host prefixes daalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Chaar transfer types: real-time audio, real-time video, transactional, bulk. Layer 3/4 apps ports aur prefixes se, Layer 7 apps domain names (16 tak, case-sensitive) se identify hote hain. Global prefixes har jagah identical; local prefixes site ke hisaab se alag aur sites se attach karne padte hain.</p></div>
<div class="scn"><h4>Woh rule jo kuch match nahi karta tha</h4><p>Payment VLAN ke liye naye path rule mein PAY-LAN naam ka local prefix use hua. Sab sahi dikh raha tha, phir bhi payment traffic har store par default path use karta raha. Local prefix bana tha par sites se kabhi attach nahi hua, isliye runtime par khaali tha. 40 stores se attach karne ke baad rule match karne laga.</p><p><b>Seekh:</b> local prefix tab tak sirf ek naam hai jab tak har site ke liye values na di jayein.</p></div>
<div class="iv"><p class="q">"Global aur local prefix mein kya farak hai, aur local kyun use karte hain?"</p><p>Global prefix mein har site par same IP ranges hote hain; local prefix mein values branch ke hisaab se alag hoti hain. Local prefixes ek rule, jaise "is site ka payment network", ko 40 near-identical rules ki jagah saari branches par kaam karne dete hain. Unhe kaam karne ke liye sites se attach karna padta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>App-defs traffic identify karte hain; custom apps Layer 3/4 (ports) ya Layer 7 (domains) ho sakte hain.</li>
<li>Transfer types: real-time audio, real-time video, transactional, bulk; yeh queueing chalate hain.</li>
<li>Network contexts ek hi application ko alag communities ke liye segment karte hain.</li>
<li>Prefix filters global (har jagah same) ya local (per site, attach karna zaroori) hote hain.</li>
<li>Rules likhne se pehle application aur segment catalogue taiyar karo.</li>
</ul></div>
`}};export{e as default};