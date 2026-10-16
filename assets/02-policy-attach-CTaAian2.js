var e={id:`policy-attach`,h:{en:`Where profiles attach: policy, inspection mode and profile groups`,hi:`Profiles kahan attach hote hain: policy, inspection mode aur profile groups`},body:{en:`
<p>Before we configure any engine, you need to see the socket they plug into. Think of a firewall policy as a power strip: it has fixed sockets labelled <code>ssl-ssh-profile</code>, <code>av-profile</code>, <code>webfilter-profile</code>, <code>ips-sensor</code> and <code>application-list</code>. A security profile is an appliance you plug into the right socket. Nothing happens if the socket is empty, and nothing happens if the strip itself is switched off.</p>

<h3>The switch: security profiles on the policy</h3>
<p>Only policies whose action is <code>accept</code> (or IPsec) can carry profiles. Deny policies never inspect content. In the CLI of the FortiOS builds modelled in this course, the profile options are revealed after <code>set utm-status enable</code>. "UTM" stands for Unified Threat Management, the older name for this bundle of engines. On newer builds the GUI simply shows a Security Profiles section; the profile names you select are the same.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code"><span class="c"># One policy with all five sockets filled</span>
config firewall policy
    edit 10
        set name "LAN-to-WAN-UTM"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set inspection-mode flow
        set ssl-ssh-profile "certificate-inspection"
        set webfilter-profile "NK-WEB"
        set application-list "NK-APP"
        set av-profile "NK-AV"
        set ips-sensor "NK-IPS"
        set logtraffic all
        set nat enable
    next
end</pre>

<h3>Two inspection modes: flow and proxy</h3>
<p><b>Flow-based</b> inspection (the default since FortiOS 6.4 for new policies) looks at packets as they stream through, with a small buffer. It is fast, it can use hardware help, and it has low latency. <b>Proxy-based</b> inspection terminates the connection on the FortiGate, buffers the whole object (a web page, a file), inspects it, and only then opens or relays the other side. It is slower and uses more memory, but a few features need it: for example, some web filter options, full antivirus archive handling, and certain data-leak features.</p>
<p>The mode is set per policy with <code>set inspection-mode flow</code> or <code>proxy</code>. A profile also carries a <code>feature-set</code> (flow or proxy). A proxy-only feature on a flow policy is refused, which is a classic reason a profile "will not save" or "will not attach".</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Profile order">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">Policy match</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">accept</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">SSL inspection</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">decrypt or not</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">Web filter</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">URL, category</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">Antivirus + IPS</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">content, patterns</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">App control</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">app, risk</text>
</svg><p class="cap">Profiles hang off a single accepted policy. The SSL inspection profile decides how much of the traffic the other engines can read.</p></div>

<h3>The ssl-ssh-profile is always present</h3>
<p>Every policy that has security profiles also has an <code>ssl-ssh-profile</code>. The default choice <code>no-inspection</code> means encrypted sessions are not decrypted at all. <code>certificate-inspection</code> reads only the TLS handshake (server name and certificate). <code>deep-inspection</code> decrypts and re-encrypts so every engine sees the plain content. You will study this in depth in <b>nse4-ssl</b>; for now remember that if the SSL profile is weak, your other profiles are partly blind on encrypted traffic.</p>

<h3>Profile groups: one switch for a bundle</h3>
<p>If many policies need the same set of profiles, a <b>profile group</b> bundles them. In the policy you choose <code>profile-type group</code> and then name the group instead of picking five separate profiles.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall profile-group
    edit "NK-STANDARD"
        set ssl-ssh-profile "certificate-inspection"
        set webfilter-profile "NK-WEB"
        set application-list "NK-APP"
        set av-profile "NK-AV"
        set ips-sensor "NK-IPS"
    next
end
config firewall policy
    edit 10
        set utm-status enable
        set profile-type group
        set profile-group "NK-STANDARD"
    next
end</pre>
<p>A policy uses either <code>single</code> (individual profiles) or <code>group</code>, never both at once. When you flip to a group, the individual selections are hidden; flip back and they return to defaults.</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab has three policies out of the Pune LAN: staff to internet (10.0.1.0/24), guests to internet, and servers to updates. Staff and guests both need web filter and IPS, but guests also need strict application control. Create profile group <code>NK-STAFF</code> and <code>NK-GUEST</code>. Server updates use only <code>av-profile</code> and <code>ips-sensor</code> directly. Three policies, two groups, one clear picture.</p></div>

<div class="warn"><p><b>Common mistake.</b> Editing a profile and expecting existing sessions to change at once. Sessions that already exist keep the verdict that was made when they started; new sessions use the new profile. During testing, clear the session for the test client, exactly as you learned in <b>nse4-diag</b> with <code>diagnose sys session clear</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profiles can only be deleted when nothing references them, and the built-in read-only profiles (for example <code>default</code>, <code>certificate-inspection</code>, <code>deep-inspection</code>, <code>no-inspection</code>) cannot be edited; clone them. Also remember a policy chooses either profile-type single or profile-type group.</p></div>

<div class="scn"><h4>"I changed the profile but nothing happens"</h4><p>An engineer added Gambling to a web filter profile at 11:00 and tested from a PC that had a long-lived connection to a gambling site. The page kept working. A second engineer checked the policy ID with the debug flow, saw the correct policy was hit, then cleared the PC's sessions. The next request showed the block page. The profile was right, the session was stale.</p><p><b>Lesson:</b> test with a fresh session, and always confirm which policy the traffic actually matches.</p></div>

<div class="iv"><p class="q">"How do you apply several security profiles to many policies without repeating yourself?"</p><p>Create a profile group under <code>config firewall profile-group</code> and select it in each policy with <code>profile-type group</code>. Changes to a member profile apply to every policy through the group. Mention that profiles only apply to accept policies and that the SSL/SSH inspection profile decides how much encrypted content the other engines see.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Profiles plug into accept policies through fixed fields: ssl-ssh-profile, webfilter-profile, application-list, av-profile, ips-sensor.</li>
<li>Flow mode is fast and default for new policies; proxy mode buffers whole objects and enables a few extra features.</li>
<li>Policy uses either single profiles or one profile group.</li>
<li>Existing sessions keep their old verdict; test with new sessions.</li>
<li>Built-in profiles are read-only; clone to customise.</li>
</ul></div>
`,hi:`
<p>Kisi bhi engine ko configure karne se pehle woh socket dekho jisme woh plug hote hain. Firewall policy ko power strip samjho: usme fixed sockets hain jin par <code>ssl-ssh-profile</code>, <code>av-profile</code>, <code>webfilter-profile</code>, <code>ips-sensor</code> aur <code>application-list</code> likha hai. Security profile ek appliance hai jise sahi socket mein lagate ho. Socket khali ho to kuch nahi hota, aur strip hi off ho to bhi kuch nahi hota.</p>

<h3>Switch: policy par security profiles</h3>
<p>Sirf wahi policies profiles rakh sakti hain jinka action <code>accept</code> (ya IPsec) ho. Deny policies kabhi content inspect nahi karti. Is course mein modelled FortiOS builds ke CLI mein profile options <code>set utm-status enable</code> ke baad dikhte hain. "UTM" matlab Unified Threat Management, in engines ke bundle ka purana naam. Naye builds mein GUI sirf Security Profiles section dikhata hai; jo profile names aap select karte ho woh wahi rehte hain.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code"><span class="c"># Ek policy jisme paancho sockets bhare hain</span>
config firewall policy
    edit 10
        set name "LAN-to-WAN-UTM"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set inspection-mode flow
        set ssl-ssh-profile "certificate-inspection"
        set webfilter-profile "NK-WEB"
        set application-list "NK-APP"
        set av-profile "NK-AV"
        set ips-sensor "NK-IPS"
        set logtraffic all
        set nat enable
    next
end</pre>

<h3>Do inspection modes: flow aur proxy</h3>
<p><b>Flow-based</b> inspection (naye policies ke liye FortiOS 6.4 se default) packets ko stream hote hue chhote buffer ke saath dekhta hai. Yeh fast hai, hardware help le sakta hai, aur latency kam hoti hai. <b>Proxy-based</b> inspection connection FortiGate par terminate karta hai, poora object (web page, file) buffer karta hai, inspect karta hai, aur tab doosri taraf kholta ya relay karta hai. Yeh slow hai aur zyada memory leta hai, lekin kuch features ko iski zaroorat hoti hai: jaise kuch web filter options, poora antivirus archive handling, aur kuch data-leak features.</p>
<p>Mode har policy mein <code>set inspection-mode flow</code> ya <code>proxy</code> se set hota hai. Profile ka bhi ek <code>feature-set</code> (flow ya proxy) hota hai. Flow policy par proxy-only feature refuse ho jaata hai, jo "profile save nahi ho raha" ya "attach nahi ho raha" ki classic wajah hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Profile order">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">Policy match</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">accept</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">SSL inspection</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">decrypt ya nahi</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">Web filter</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">URL, category</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">Antivirus + IPS</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">content, patterns</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="10.4">App control</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="9.4">app, risk</text>
</svg><p class="cap">Profiles ek hi accepted policy se jude hain. SSL inspection profile decide karta hai ki baaki engines kitna traffic padh sakte hain.</p></div>

<h3>ssl-ssh-profile hamesha maujood hota hai</h3>
<p>Jis policy mein security profiles hote hain usme <code>ssl-ssh-profile</code> bhi hota hai. Default choice <code>no-inspection</code> ka matlab encrypted sessions bilkul decrypt nahi hote. <code>certificate-inspection</code> sirf TLS handshake (server name aur certificate) padhta hai. <code>deep-inspection</code> decrypt aur re-encrypt karta hai taaki har engine plain content dekhe. Iska detail <b>nse4-ssl</b> mein hai; abhi yaad rakho ki SSL profile kamzor ho to encrypted traffic par aapke baaki profiles aanshik andhe hain.</p>

<h3>Profile groups: ek switch, poora bundle</h3>
<p>Agar kai policies ko wahi profiles ka set chahiye, to <b>profile group</b> unhe bundle karta hai. Policy mein aap <code>profile-type group</code> chunte ho aur paanch alag profiles ki jagah group ka naam dete ho.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall profile-group
    edit "NK-STANDARD"
        set ssl-ssh-profile "certificate-inspection"
        set webfilter-profile "NK-WEB"
        set application-list "NK-APP"
        set av-profile "NK-AV"
        set ips-sensor "NK-IPS"
    next
end
config firewall policy
    edit 10
        set utm-status enable
        set profile-type group
        set profile-group "NK-STANDARD"
    next
end</pre>
<p>Policy ya to <code>single</code> (alag profiles) use karti hai ya <code>group</code>, dono ek saath kabhi nahi. Group par jaate hi individual selections chhup jaate hain; wapas aao to defaults par laut aate hain.</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab ki Pune LAN se teen policies hain: staff se internet (10.0.1.0/24), guests se internet, aur servers se updates. Staff aur guests dono ko web filter aur IPS chahiye, lekin guests ko strict application control bhi chahiye. Profile group <code>NK-STAFF</code> aur <code>NK-GUEST</code> banao. Server updates sirf <code>av-profile</code> aur <code>ips-sensor</code> seedha use karte hain. Teen policies, do groups, ek saaf picture.</p></div>

<div class="warn"><p><b>Common mistake.</b> Profile edit karke umeed karna ki existing sessions turant badal jaayenge. Jo sessions pehle se hain woh wahi verdict rakhte hain jo shuru mein bana tha; naye sessions naya profile use karte hain. Testing mein test client ka session clear karo, jaise <b>nse4-diag</b> mein <code>diagnose sys session clear</code> se seekha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profiles tabhi delete hote hain jab koi unhe reference na kare, aur built-in read-only profiles (jaise <code>default</code>, <code>certificate-inspection</code>, <code>deep-inspection</code>, <code>no-inspection</code>) edit nahi hote; unhe clone karo. Yeh bhi yaad rakho ki policy profile-type single ya profile-type group chunti hai.</p></div>

<div class="scn"><h4>"Profile badla par kuch nahi hua"</h4><p>Ek engineer ne 11:00 baje web filter profile mein Gambling jodi aur ek aise PC se test kiya jiska gambling site se lamba connection pehle se tha. Page chalta raha. Doosre engineer ne debug flow se dekha ki sahi policy hit ho rahi hai, phir PC ke sessions clear kiye. Agli request par block page aaya. Profile sahi tha, session purana tha.</p><p><b>Lesson:</b> fresh session se test karo, aur hamesha confirm karo ki traffic asal mein kaunsi policy match karta hai.</p></div>

<div class="iv"><p class="q">"Kai policies par repeat kiye bina kai security profiles kaise lagate ho?"</p><p><code>config firewall profile-group</code> mein profile group banao aur har policy mein <code>profile-type group</code> ke saath select karo. Member profile mein change group ke through har policy par lagta hai. Batao ki profiles sirf accept policies par lagte hain aur SSL/SSH inspection profile decide karta hai ki baaki engines encrypted content kitna dekhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Profiles accept policies mein fixed fields se lagte hain: ssl-ssh-profile, webfilter-profile, application-list, av-profile, ips-sensor.</li>
<li>Flow mode fast aur naye policies ke liye default hai; proxy mode poore objects buffer karta hai aur kuch extra features deta hai.</li>
<li>Policy single profiles ya ek profile group use karti hai.</li>
<li>Existing sessions purana verdict rakhte hain; naye sessions se test karo.</li>
<li>Built-in profiles read-only hain; customise karne ke liye clone karo.</li>
</ul></div>
`}};export{e as default};