var e={id:`web-filter`,h:{en:`Web filter: FortiGuard categories, URL filter and local ratings`,hi:`Web filter: FortiGuard categories, URL filter aur local ratings`},body:{en:`
<p>A web filter is the receptionist who checks a visitor's destination against the building's rules: "Finance floor is open, the casino next door is not." On a FortiGate the receptionist uses three sources of knowledge, in a fixed order: your own <b>static URL filter</b>, the <b>FortiGuard category rating</b> of the site, and a few extra options such as safe search. Understanding the order is half of this chapter.</p>

<h3>FortiGuard categories</h3>
<p>FortiGuard rates websites into about 90 categories, grouped into seven groups such as <i>Potentially Liable</i>, <i>Adult/Mature Content</i>, <i>Bandwidth Consuming</i>, <i>Security Risk</i>, <i>General Interest - Personal</i>, <i>General Interest - Business</i> and <i>Unrated</i>. Each category has a numeric ID. Examples used in this course: 11 Gambling, 26 Malicious Websites, 61 Phishing, 37 Social Networking, 25 Streaming Media and Download, 49 Business, 0 Unrated. When a user requests a site, the FortiGate asks FortiGuard (and caches the answer) for the category, then looks up the action for that category in the profile.</p>
<p>Available actions per category: <b>block</b> (show a replacement page), <b>monitor</b> (allow and log), <b>warning</b> (show a page the user can click through, valid for a set duration) and <b>authenticate</b> (require credentials to continue). There is no "allow" action: allowing a category simply means having no filter entry for it. Categories you do not list are allowed.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config webfilter profile
    edit "NK-WEB"
        set comment "Pune staff browsing"
        config ftgd-wf
            config filters
                edit 1
                    set category 26
                    set action block
                next
                edit 2
                    set category 61
                    set action block
                next
                edit 3
                    set category 11
                    set action block
                next
                edit 4
                    set category 25
                    set action warning
                    set warn-duration 15m
                next
            end
        end
    next
end</pre>

<h3>Static URL filter: your own list, checked first</h3>
<p>The static URL filter is a table of URL patterns with an action. It runs <b>before</b> the FortiGuard category check. Entry types are <code>simple</code> (exact host, optionally with a path), <code>wildcard</code> (for example <code>*.example</code>) and <code>regex</code>. Actions are <code>allow</code>, <code>block</code>, <code>monitor</code> and <code>exempt</code>. The difference matters: <b>allow</b> lets the URL pass the static filter but later checks (FortiGuard category, antivirus) still run, while <b>exempt</b> bypasses the remaining web filter checks and also skips antivirus and some other scans for that traffic, so use it sparingly.</p>
<pre class="code">config webfilter urlfilter
    edit 1
        set name "NK-URLS"
        config entries
            edit 1
                set url "hr.zenith.example"
                set type simple
                set action allow
            next
            edit 2
                set url "*.ads.example"
                set type wildcard
                set action block
            next
        end
    next
end
config webfilter profile
    edit "NK-WEB"
        config web
            set urlfilter-table 1
        end
    next
end</pre>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Web filter order">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.3">Static URL filter</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.3">your list</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.3">FortiGuard rating</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.3">category action</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.3">Extra options</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.3">safe search, logs</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.3">Verdict</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.3">allow, warn, block</text>
</svg><p class="cap">Check order: your own URL list first, then the FortiGuard category action.</p></div>

<h3>Local ratings and unrated sites</h3>
<p>FortiGuard sometimes rates a site wrongly, or has no rating for a new internal site (<b>Unrated</b>, category 0). Rather than allowing everything, create a <b>local rating</b> that tells this FortiGate which category to use: <code>config webfilter ftgd-local-rating</code>, entry <code>"stream.example"</code>, <code>set rating 49</code> to treat it as Business. You can also create your own local category (IDs 140-191) in <code>config webfilter ftgd-local-cat</code>. Blocking Unrated is a strong security baseline, but expect to maintain a list of internal exceptions.</p>

<h3>What a web filter can see on HTTPS</h3>
<p>For plain HTTP the FortiGate sees the full URL. For HTTPS without deep inspection it sees only the <b>server name (SNI)</b> and the certificate subject, so it can apply category and host rules but cannot filter by path (<code>/news/sports</code>) or search keywords. That is why the <code>ssl-ssh-profile</code> from the previous chapter matters. Details come in nse4-ssl.</p>

<div class="eg"><p><b>Worked example.</b> A staff member opens <code>royal-casino.example</code>. The static URL filter has no entry. FortiGuard returns category 11 Gambling. The profile has filter 3 with action block, so the user gets a replacement page naming the category, and the FortiGate writes a web filter log with the host, category and action. When the same user opens <code>hr.zenith.example</code>, the static entry 1 allows it, even though FortiGuard rates it Unrated, because the URL list runs first.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using <code>exempt</code> as a convenient "allow". Exempt skips later inspections for that traffic. Use <code>allow</code> unless you deliberately want to bypass the other scans, for example for a trusted update server that breaks under inspection.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order is static URL filter first, then FortiGuard categories. And there is no "allow" action for a category in the filter list; absent entry means allowed. A category filter with action warning shows a click-through page for the configured duration.</p></div>

<div class="scn"><h4>The streaming site that was rated Business</h4><p>A partner's training portal <code>stream.example</code> was rated Streaming Media by FortiGuard, so the "warn before streaming" rule interrupted every staff login. Blocking FortiGuard changes was not possible, and exempting the whole host would have skipped antivirus. The engineer added a local rating of 49 (Business) for that host only. The warning disappeared, and antivirus still scanned downloads from it.</p><p><b>Lesson:</b> prefer a local rating over exempt when the issue is a wrong category.</p></div>

<div class="iv"><p class="q">"A website is blocked by your web filter but the business needs it. How do you fix it safely?"</p><p>First confirm the category in the web filter log. If the rating is wrong, add a local rating for that host. If the category is right but this one site is trusted, add a static URL filter entry with action allow (not exempt), scoped as narrowly as possible. Document it and review it periodically.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: static URL filter, then FortiGuard category action.</li>
<li>Category actions: block, monitor, warning, authenticate; no entry means allowed.</li>
<li>URL entry types: simple, wildcard, regex; actions allow, block, monitor, exempt.</li>
<li>Use a local rating to fix a mis-rated or unrated site; avoid exempt.</li>
<li>Without deep inspection, HTTPS filtering sees only SNI and certificate details.</li>
</ul></div>
`,hi:`
<p>Web filter receptionist ki tarah hai jo visitor ki destination ko building ke rules se check karta hai: "Finance floor khula hai, bagal wala casino nahi." FortiGate par receptionist teen sources use karta hai, fixed order mein: aapka apna <b>static URL filter</b>, site ki <b>FortiGuard category rating</b>, aur safe search jaise kuch extra options. Order samajhna is chapter ka aadha hissa hai.</p>

<h3>FortiGuard categories</h3>
<p>FortiGuard websites ko lagbhag 90 categories mein rate karta hai, jo saat groups mein bante hain jaise <i>Potentially Liable</i>, <i>Adult/Mature Content</i>, <i>Bandwidth Consuming</i>, <i>Security Risk</i>, <i>General Interest - Personal</i>, <i>General Interest - Business</i> aur <i>Unrated</i>. Har category ki numeric ID hoti hai. Is course ke examples: 11 Gambling, 26 Malicious Websites, 61 Phishing, 37 Social Networking, 25 Streaming Media and Download, 49 Business, 0 Unrated. User jab site maangta hai, FortiGate FortiGuard se category poochta hai (aur jawab cache karta hai), phir profile mein us category ka action dhoondhta hai.</p>
<p>Har category ke liye actions: <b>block</b> (replacement page dikhao), <b>monitor</b> (allow aur log), <b>warning</b> (aisa page jisse user click karke aage ja sakta hai, set duration tak valid) aur <b>authenticate</b> (aage badhne ke liye credentials). "Allow" action nahi hota: category allow karne ka matlab uske liye filter entry hi na rakhna. Jo categories list mein nahi hain woh allowed hain.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config webfilter profile
    edit "NK-WEB"
        set comment "Pune staff browsing"
        config ftgd-wf
            config filters
                edit 1
                    set category 26
                    set action block
                next
                edit 2
                    set category 61
                    set action block
                next
                edit 3
                    set category 11
                    set action block
                next
                edit 4
                    set category 25
                    set action warning
                    set warn-duration 15m
                next
            end
        end
    next
end</pre>

<h3>Static URL filter: aapki apni list, sabse pehle check hoti hai</h3>
<p>Static URL filter URL patterns aur action ki table hai. Yeh FortiGuard category check se <b>pehle</b> chalta hai. Entry types: <code>simple</code> (exact host, chahe to path ke saath), <code>wildcard</code> (jaise <code>*.example</code>) aur <code>regex</code>. Actions: <code>allow</code>, <code>block</code>, <code>monitor</code> aur <code>exempt</code>. Fark zaroori hai: <b>allow</b> URL ko static filter se guzarne deta hai lekin baad ke checks (FortiGuard category, antivirus) phir bhi chalte hain, jabki <b>exempt</b> baaki web filter checks bypass karta hai aur us traffic par antivirus aur kuch doosre scans bhi skip karta hai, isliye kam use karo.</p>
<pre class="code">config webfilter urlfilter
    edit 1
        set name "NK-URLS"
        config entries
            edit 1
                set url "hr.zenith.example"
                set type simple
                set action allow
            next
            edit 2
                set url "*.ads.example"
                set type wildcard
                set action block
            next
        end
    next
end
config webfilter profile
    edit "NK-WEB"
        config web
            set urlfilter-table 1
        end
    next
end</pre>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Web filter order">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.3">Static URL filter</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.3">aapki list</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.3">FortiGuard rating</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.3">category action</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.3">Extra options</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.3">safe search, logs</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.3">Verdict</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.3">allow, warn, block</text>
</svg><p class="cap">Check order: pehle aapki URL list, phir FortiGuard category action.</p></div>

<h3>Local ratings aur unrated sites</h3>
<p>FortiGuard kabhi site ko galat rate karta hai, ya naye internal site ki rating hoti hi nahi (<b>Unrated</b>, category 0). Sab kuch allow karne ke bajay <b>local rating</b> banao jo is FortiGate ko batati hai ki kaunsi category use kare: <code>config webfilter ftgd-local-rating</code>, entry <code>"stream.example"</code>, <code>set rating 49</code> taaki Business maana jaaye. Aap apni local category (IDs 140-191) bhi <code>config webfilter ftgd-local-cat</code> mein bana sakte ho. Unrated block karna strong security baseline hai, lekin internal exceptions ki list maintain karne ke liye taiyar raho.</p>

<h3>HTTPS par web filter kya dekh sakta hai</h3>
<p>Plain HTTP mein FortiGate poora URL dekhta hai. Deep inspection ke bina HTTPS mein sirf <b>server name (SNI)</b> aur certificate subject dikhta hai, isliye category aur host rules lag sakte hain lekin path (<code>/news/sports</code>) ya search keywords se filter nahi ho sakta. Isiliye pichhle chapter ka <code>ssl-ssh-profile</code> matter karta hai. Detail nse4-ssl mein.</p>

<div class="eg"><p><b>Worked example.</b> Staff member <code>royal-casino.example</code> kholta hai. Static URL filter mein entry nahi. FortiGuard category 11 Gambling deta hai. Profile ke filter 3 ka action block hai, isliye user ko category ka naam batane wala replacement page milta hai, aur FortiGate host, category aur action ke saath web filter log likhta hai. Wahi user jab <code>hr.zenith.example</code> kholta hai, static entry 1 use allow karti hai, chahe FortiGuard use Unrated rate kare, kyunki URL list pehle chalti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>exempt</code> ko convenient "allow" ki tarah use karna. Exempt us traffic par baad ke inspections skip karta hai. <code>allow</code> use karo jab tak aap jaan-boojhkar baaki scans bypass na karna chahte ho, jaise inspection mein tootne wale trusted update server ke liye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order hai pehle static URL filter, phir FortiGuard categories. Aur filter list mein category ke liye "allow" action nahi hota; entry na hona matlab allowed. Warning action wali category configured duration tak click-through page dikhati hai.</p></div>

<div class="scn"><h4>Streaming site jo Business rate honi chahiye thi</h4><p>Partner ka training portal <code>stream.example</code> FortiGuard ne Streaming Media rate kiya, isliye "streaming se pehle warning" rule har staff login ko rok raha tha. FortiGuard ka rating badalna possible nahi tha, aur poora host exempt karne se antivirus skip ho jaata. Engineer ne sirf us host ke liye local rating 49 (Business) jodi. Warning gayab ho gayi, aur antivirus ab bhi us se downloads scan karta raha.</p><p><b>Lesson:</b> category galat ho to exempt ke bajay local rating ko prefer karo.</p></div>

<div class="iv"><p class="q">"Web filter ek website block kar raha hai par business ko chahiye. Safely kaise fix karoge?"</p><p>Pehle web filter log mein category confirm karo. Rating galat ho to us host ke liye local rating jodo. Category sahi hai lekin yeh ek site trusted hai to static URL filter entry action allow (exempt nahi) ke saath, jitna ho sake narrow scope mein. Document karo aur periodically review karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: static URL filter, phir FortiGuard category action.</li>
<li>Category actions: block, monitor, warning, authenticate; entry na ho to allowed.</li>
<li>URL entry types: simple, wildcard, regex; actions allow, block, monitor, exempt.</li>
<li>Galat rate ya unrated site ke liye local rating use karo; exempt se bacho.</li>
<li>Deep inspection ke bina HTTPS filtering sirf SNI aur certificate details dekhti hai.</li>
</ul></div>
`}};export{e as default};