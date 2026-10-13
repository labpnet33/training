var e={id:`application-control`,h:{en:`Application control: signatures, categories and actions`,hi:`Application control: signatures, categories aur actions`},body:{en:`
<p>Port numbers lie. Today almost everything runs over port 443, so "allow TCP 443" tells you nothing about whether the traffic is a bank, a video call or a file-sharing client. <b>Application control</b> identifies the application by its behaviour and signatures, regardless of port, so you can write rules such as "allow Microsoft Teams, block BitTorrent". Think of it as a customs officer who opens the box instead of reading the label on the outside.</p>

<h3>How applications are identified</h3>
<p>FortiGuard supplies an application signature database. Each application has a name, a <b>category</b> (for example P2P, Proxy, Remote.Access, Video/Audio, Social.Media, Cloud.IT, Email, Business), a <b>risk</b> level from 1 (low) to 5 (critical), a popularity rating, and technology and behaviour tags. The engine uses protocol patterns, server names and, where it can read them, content. Names look like <code>BitTorrent</code>, <code>TeamViewer</code>, <code>Facebook</code>. Two caveats: first, applications riding inside encrypted sessions can be fully identified only with deep inspection; second, a single website can host several applications (a social site with games and chat).</p>

<h3>The application list and its entries</h3>
<p>The profile is called an <b>application list</b>. It contains numbered entries evaluated in order. An entry selects applications by <b>category</b>, <b>risk</b>, <b>application</b> name, <b>popularity</b> or <b>technology/behaviour</b>, and applies an action: <code>pass</code> (allow), <code>block</code> (drop and log) or <code>reset</code> (send TCP resets). In the GUI "Monitor" is simply <code>pass</code> with logging enabled. You can add <code>quarantine</code> to put an offending source address in the banned-user list for a time.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config application list
    edit "NK-APP"
        set comment "Pune staff: no P2P, no unknown remote tools"
        set other-application-log enable
        config entries
            edit 1
                set category 2
                set action block
                set log enable
            next
            edit 2
                set category 7
                set action block
                set log enable
            next
            edit 3
                set risk 4 5
                set action block
                set log enable
            next
            edit 4
                set category 5
                set action pass
                set log enable
            next
        end
    next
end</pre>
<p>Here category 2 is P2P and category 7 is Remote.Access. Entry 3 blocks all applications of high risk, entry 4 monitors video and audio. Applications that match no entry fall to the list's default: <code>other-application-action</code> (default pass) and <code>unknown-application-action</code>.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Application control flow">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Packet or flow</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">from the policy</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Signature match</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">name, category, risk</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Entries in order</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">first match wins</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Action</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">pass, block, reset</text>
</svg><p class="cap">The engine identifies the application, then walks the list entries from the top.</p></div>

<h3>Useful options</h3>
<ul>
<li><b>enforce-default-app-port</b>: an application is accepted only on its standard port; the same signature elsewhere is treated as a violation. Good against tunnelling over port 443.</li>
<li><b>deep-app-inspection</b>: looks deeper inside some applications (needs decryption for encrypted ones).</li>
<li><b>options</b>: <code>allow-dns</code>, <code>allow-icmp</code>, <code>allow-h&#116;tp</code>, <code>allow-ssl</code> let basic protocols through while the engine is still identifying the application, preventing slow page loads at the start of a session.</li>
<li><b>Application and Filter overrides</b>: in the GUI you can override one signature inside a broad category rule.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Staff laptop <code>10.0.1.10</code> starts a peer-to-peer client. The policy matches, the application list engine identifies BitTorrent in category P2P, entry 1 says block, the session is dropped and an application control log with <code>app="BitTorrent"</code>, <code>action="block"</code> is written. At the same time a Teams call to a Microsoft service matches no blocking entry and passes. Same port numbers, different application, different decision.</p></div>

<div class="warn"><p><b>Common mistake.</b> Blocking a whole category and breaking something business-critical, because one popular business app lives in that category. Start in monitor (<code>pass</code> with log) for a week, read the logs, then block. Another mistake is forgetting that the first matching entry wins, so a broad block entry above a specific allow entry hides it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Application control needs the traffic to be identifiable. In flow mode and with SSL profile no-inspection, many encrypted applications are identified only by the server name in the TLS handshake. Also remember that actions are pass, block and reset; "monitor" is pass with logging.</p></div>

<div class="scn"><h4>The remote-support tool nobody approved</h4><p>The security team noticed in a weekly log review that a branch PC held a long session to an unknown remote-access application. The application list had been in monitor for a month, so the traffic was allowed but logged with the application name and risk level. After approval from IT, the team changed that entry to block and added the application to the exceptions list for the two support engineers who legitimately needed it, using a separate policy and a separate list.</p><p><b>Lesson:</b> monitor first gives you evidence and prevents blind blocks.</p></div>

<div class="iv"><p class="q">"Why use application control when the policy already allows only port 443?"</p><p>Because port 443 carries thousands of different applications. Application control identifies the application by signature, category and risk, independent of port, so you can allow Teams and block a proxy or file-sharing client on the same port. For encrypted traffic, mention that deep inspection improves identification accuracy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Application control identifies applications by signature, regardless of port.</li>
<li>Each application has a category and risk (1-5); entries select by category, risk, name or behaviour.</li>
<li>Entries are evaluated in order; actions are pass, block, reset (monitor = pass + log).</li>
<li>Start in monitor, review logs, then block.</li>
<li>Encrypted applications are identified best with deep inspection.</li>
</ul></div>
`,hi:`
<p>Port numbers jhoot bolte hain. Aaj lagbhag sab kuch port 443 par chalta hai, isliye "allow TCP 443" yeh nahi batata ki traffic bank hai, video call hai ya file-sharing client. <b>Application control</b> application ko uske behaviour aur signatures se pehchanta hai, port chahe jo ho, taaki aap "Microsoft Teams allow, BitTorrent block" jaise rules likh sako. Ise customs officer samjho jo box kholta hai, bahar ka label nahi padhta.</p>

<h3>Applications kaise pehchane jaate hain</h3>
<p>FortiGuard application signature database deta hai. Har application ka ek naam, ek <b>category</b> (jaise P2P, Proxy, Remote.Access, Video/Audio, Social.Media, Cloud.IT, Email, Business), 1 (low) se 5 (critical) tak <b>risk</b> level, popularity rating, aur technology aur behaviour tags hote hain. Engine protocol patterns, server names aur jahan padh sake wahan content use karta hai. Naam aise dikhte hain: <code>BitTorrent</code>, <code>TeamViewer</code>, <code>Facebook</code>. Do caveats: pehla, encrypted sessions ke andar chalti applications poori tarah sirf deep inspection se pehchani ja sakti hain; doosra, ek website kai applications host kar sakti hai (social site jisme games aur chat ho).</p>

<h3>Application list aur uski entries</h3>
<p>Is profile ko <b>application list</b> kehte hain. Isme numbered entries order mein evaluate hoti hain. Entry applications ko <b>category</b>, <b>risk</b>, <b>application</b> naam, <b>popularity</b> ya <b>technology/behaviour</b> se select karti hai aur action lagati hai: <code>pass</code> (allow), <code>block</code> (drop aur log) ya <code>reset</code> (TCP resets bhejo). GUI mein "Monitor" matlab logging ke saath <code>pass</code>. Aap <code>quarantine</code> jod sakte ho jisse offending source address kuch der ke liye banned-user list mein chala jaata hai.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config application list
    edit "NK-APP"
        set comment "Pune staff: no P2P, no unknown remote tools"
        set other-application-log enable
        config entries
            edit 1
                set category 2
                set action block
                set log enable
            next
            edit 2
                set category 7
                set action block
                set log enable
            next
            edit 3
                set risk 4 5
                set action block
                set log enable
            next
            edit 4
                set category 5
                set action pass
                set log enable
            next
        end
    next
end</pre>
<p>Yahan category 2 P2P hai aur category 7 Remote.Access. Entry 3 saari high-risk applications block karti hai, entry 4 video aur audio monitor karti hai. Jo applications kisi entry se match nahi karti woh list ke default par jaati hain: <code>other-application-action</code> (default pass) aur <code>unknown-application-action</code>.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Application control flow">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.6">Packet ya flow</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.6">policy se</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.6">Signature match</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.6">naam, category, risk</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.6">Entries order mein</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.6">pehla match jeetta</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.6">Action</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.6">pass, block, reset</text>
</svg><p class="cap">Engine application pehchanta hai, phir list ki entries upar se neeche chalta hai.</p></div>

<h3>Kaam ke options</h3>
<ul>
<li><b>enforce-default-app-port</b>: application sirf apne standard port par accepted; wahi signature kahin aur ho to violation. Port 443 par tunnelling ke khilaaf accha.</li>
<li><b>deep-app-inspection</b>: kuch applications ke andar aur gehra dekhta hai (encrypted ke liye decryption chahiye).</li>
<li><b>options</b>: <code>allow-dns</code>, <code>allow-icmp</code>, <code>allow-h&#116;tp</code>, <code>allow-ssl</code> engine ke pehchanne tak basic protocols ko jaane dete hain, taaki session ki shuruaat mein pages dheere load na hon.</li>
<li><b>Application aur Filter overrides</b>: GUI mein broad category rule ke andar ek signature ko override kar sakte ho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Staff laptop <code>10.0.1.10</code> peer-to-peer client shuru karta hai. Policy match hoti hai, application list engine BitTorrent ko category P2P mein pehchanta hai, entry 1 kehti hai block, session drop hota hai aur <code>app="BitTorrent"</code>, <code>action="block"</code> wala application control log likha jaata hai. Usi waqt Microsoft service ko Teams call kisi blocking entry se match nahi karti aur pass ho jaati hai. Same port numbers, alag application, alag decision.</p></div>

<div class="warn"><p><b>Common mistake.</b> Poori category block karke kuch business-critical tod dena, kyunki ek popular business app usi category mein hai. Pehle ek hafta monitor (<code>pass</code> with log) rakho, logs padho, phir block karo. Doosri galti: yeh bhoolna ki pehli matching entry jeetti hai, isliye specific allow entry ke upar broad block entry use chhupa deti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Application control ko traffic identifiable chahiye. Flow mode aur SSL profile no-inspection mein kai encrypted applications sirf TLS handshake ke server name se pehchani jaati hain. Yeh bhi yaad rakho ki actions pass, block aur reset hain; "monitor" matlab pass with logging.</p></div>

<div class="scn"><h4>Remote-support tool jo kisi ne approve nahi kiya</h4><p>Security team ne weekly log review mein dekha ki ek branch PC ka ek unknown remote-access application se lamba session tha. Application list ek mahine se monitor mein thi, isliye traffic allowed tha lekin application name aur risk level ke saath log hua. IT ki approval ke baad team ne us entry ko block kiya aur do support engineers ke liye jinhe legitimately zaroorat thi, alag policy aur alag list ke saath exception banayi.</p><p><b>Lesson:</b> pehle monitor evidence deta hai aur blind blocks se bachata hai.</p></div>

<div class="iv"><p class="q">"Policy sirf port 443 allow karti hai to application control kyun chahiye?"</p><p>Kyunki port 443 hazaaron alag applications chalata hai. Application control port se independent signature, category aur risk se application pehchanta hai, isliye ek hi port par Teams allow aur proxy ya file-sharing client block ho sakta hai. Encrypted traffic ke liye batao ki deep inspection identification accuracy badhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Application control port se nahi, signature se applications pehchanta hai.</li>
<li>Har application ki category aur risk (1-5) hai; entries category, risk, naam ya behaviour se select karti hain.</li>
<li>Entries order mein evaluate hoti hain; actions pass, block, reset (monitor = pass + log).</li>
<li>Pehle monitor, logs review, phir block.</li>
<li>Encrypted applications deep inspection se sabse acchi pehchani jaati hain.</li>
</ul></div>
`}};export{e as default};