var e=(e,t)=>`<div class="dia">`+e+`<p class="cap">`+t+`</p></div>`,t=`<svg viewBox="0 0 640 250" role="img" aria-label="The scrapli layers from your script to the device">
<rect x="20" y="10" width="250" height="38" rx="8" fill="#ddd6fe"/><text x="145" y="34" text-anchor="middle" class="svg-ink" font-size="13">your script (probe.py, backup.py)</text>
<rect x="20" y="62" width="250" height="38" rx="8" fill="#bae6fd"/><text x="145" y="86" text-anchor="middle" class="svg-ink" font-size="13">Scrapli(platform="cisco_iosxe")</text>
<rect x="20" y="114" width="250" height="38" rx="8" fill="#bae6fd"/><text x="145" y="138" text-anchor="middle" class="svg-ink" font-size="13">driver: IOSXEDriver / JunosDriver</text>
<rect x="20" y="166" width="250" height="38" rx="8" fill="#fde68a"/><text x="145" y="190" text-anchor="middle" class="svg-ink" font-size="13">channel: prompts, privilege</text>
<rect x="20" y="218" width="250" height="28" rx="8" fill="#bbf7d0"/><text x="145" y="237" text-anchor="middle" class="svg-ink" font-size="13">transport: SSH</text>
<line x1="145" y1="48" x2="145" y2="62" stroke="#64748b" stroke-width="2"/><line x1="145" y1="100" x2="145" y2="114" stroke="#64748b" stroke-width="2"/><line x1="145" y1="152" x2="145" y2="166" stroke="#64748b" stroke-width="2"/><line x1="145" y1="204" x2="145" y2="218" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="30" width="290" height="44" rx="8" fill="#bbf7d0"/><text x="475" y="50" text-anchor="middle" class="svg-ink" font-size="13">Response</text><text x="475" y="66" text-anchor="middle" class="svg-muted" font-size="11">result, failed, elapsed_time</text>
<rect x="330" y="96" width="290" height="44" rx="8" fill="#bbf7d0"/><text x="475" y="116" text-anchor="middle" class="svg-ink" font-size="13">MultiResponse</text><text x="475" y="132" text-anchor="middle" class="svg-muted" font-size="11">one Response per command</text>
<rect x="330" y="162" width="290" height="44" rx="8" fill="#fed7aa"/><text x="475" y="182" text-anchor="middle" class="svg-ink" font-size="13">ScrapliException family</text><text x="475" y="198" text-anchor="middle" class="svg-muted" font-size="11">one class per kind of failure</text>
<path d="M270 81 L330 52" stroke="#64748b" stroke-width="1.5" fill="none"/><path d="M270 81 L330 118" stroke="#64748b" stroke-width="1.5" fill="none"/><path d="M270 133 L330 184" stroke="#64748b" stroke-width="1.5" fill="none"/>
</svg>`,n={id:`big-picture`,h:{en:`The big picture: why scrapli exists`,hi:`Badi tasveer: scrapli kyun bana`},body:{en:`
<p><b>What you will learn.</b> In this module you build the same multivendor toolkit you built with netmiko in <code>adv-nkmiko</code>, but with <b>scrapli</b>: a small, strict SSH library for network devices. By the end you can open a session on IOS XE, Junos and Arista EOS with one call, read the <code>Response</code> object that every command returns, parse output with TextFSM, push configuration with <code>send_configs</code> and read it back, tell the three timeouts apart, recognise every scrapli exception on sight, and explain when scrapli is the better tool and when netmiko is.</p>
<p><b>Prerequisites.</b> <code>adv-nkmiko</code> (platform names, prompts, paging, commit on Junos), <code>py-secrets</code> (passwords from environment variables and .env files), <code>py-textfsm</code> (ntc-templates) and <code>py-concurrency</code> (one connection per thread). You also need the Linux basics for heredocs and <code>sed</code>.</p>

<h3>Analogy: the courier with a receipt</h3>
<p>netmiko is a friendly receptionist: you ask a question and get an answer in words. If the answer is an error message, it is still just words, and you must notice it yourself. scrapli is a <b>courier who hands you a receipt</b> for every parcel. The parcel is the command output, and the receipt, the <code>Response</code>, says what was sent, which device answered, how long it took and, most important, whether the delivery <b>failed</b>. Receipts are easy to check in a loop, and that is exactly what automation needs.</p>

<h3>The layers</h3>
`+e(t,`Your code talks to one factory. The driver knows the platform, the channel knows the prompts, the transport carries the bytes. Every command comes back as a Response.`)+`
<p>You pick the platform with a string such as <code>cisco_iosxe</code>, and the factory gives you the matching driver. The <b>driver</b> knows the privilege levels and the error strings of that platform. The <b>channel</b> reads until the prompt returns. The <b>transport</b> is the SSH carrier: on real gear it is the system OpenSSH client by default, and you can swap it for <code>ssh2</code>, <code>paramiko</code>, <code>asyncssh</code> or telnet. Those choices are what make scrapli fast and flexible on real networks.</p>

<h3>scrapli and netmiko at a glance</h3>
<table class="cmp"><tr><th></th><th>netmiko</th><th>scrapli</th></tr>
<tr><td>Open a session</td><td><code>ConnectHandler(device_type="cisco_ios", ...)</code></td><td><code>Scrapli(platform="cisco_iosxe", ...)</code></td></tr>
<tr><td>Credentials</td><td><code>username</code>, <code>password</code>, <code>secret</code></td><td><code>auth_username</code>, <code>auth_password</code>, <code>auth_secondary</code></td></tr>
<tr><td>A command returns</td><td>a plain string</td><td>a <code>Response</code> with <code>.result</code> and <code>.failed</code></td></tr>
<tr><td>A rejected command</td><td>the error text, no flag</td><td><code>failed=True</code> and <code>raise_for_status()</code></td></tr>
<tr><td>Failures to log in</td><td>Netmiko exceptions</td><td>Scrapli exceptions, one class per cause</td></tr></table>
<p>Chapter 7 compares them line by line and ends with a decision rule.</p>

<h3>The lab network and the two labs</h3>
<p>AUTO01 (netadmin / Deccan@123) reaches three devices on 10.99.0.0/24 through SW1: the IOS XE router <b>R1</b> (10.99.0.1, prompt <code>PUN-CORE-R1#</code>), the Junos router <b>J1</b> (10.99.0.11, prompt <code>netops@J1&gt;</code>) and the Arista switch <b>E1</b> (10.99.0.21, prompt <code>E1#</code>). The login is <code>netops</code> / <code>NK@2026</code>. Lab 1 is the configure lab, <i>scrapli toolkit: collect, configure, compare with netmiko</i>. Lab 2 is the troubleshoot lab, <i>six scrapli scripts that fail, or worse, seem to succeed</i>. Chapters 2 to 7 walk Lab 1 and chapter 8 walks Lab 2.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab runs the real scrapli API on top of its own SSH transport. The arguments <code>transport</code>, <code>transport_options</code>, <code>ssh_config_file</code>, <code>comms_prompt_pattern</code> and <code>channel_log</code> are accepted and ignored. Only the five core platforms exist. Exception texts follow the lab, not the wording of the real library, and the lab has no real clock, so you cannot measure speed here. We say so again wherever it matters. Everything you write runs unchanged on real gear.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating scrapli as "netmiko with other argument names". The names are different, but the real difference is the return value. If you ignore <code>.failed</code> you throw away the main reason to use scrapli.</p></div>
<div class="exam"><p><b>Exam trap.</b> The core platform names are <code>cisco_iosxe</code>, <code>cisco_iosxr</code>, <code>cisco_nxos</code>, <code>arista_eos</code> and <code>juniper_junos</code>. <code>cisco_ios</code> is a netmiko name; scrapli does not know it.</p></div>

<div class="scn"><h4>The backup that saved an error</h4><p>A nightly job used netmiko and wrote whatever <code>send_command</code> returned into a file. After a typo in the command table, three routers were "backed up" with the text <code>% Invalid input detected</code> for two weeks. Nobody noticed until a router died. The rewrite with scrapli calls <code>raise_for_status()</code> before writing the file, so the job fails loudly on the first night.</p><p><b>Lesson:</b> the value of a library is in what it tells you when something goes wrong.</p></div>

<div class="iv"><p class="q">"Why would you choose scrapli over netmiko?"</p><p>Because each command returns a Response with a failed flag and timing, because the errors are typed exceptions, because the transport is swappable and has an async variant for large fleets, and because the API is small and strict. Netmiko has more platforms and a bigger community, so I still pick it for quick one-off scripts and for platforms scrapli does not cover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>scrapli is a small SSH library for network devices: factory, driver, channel, transport.</li>
<li>Every command returns a <code>Response</code>; several commands return a <code>MultiResponse</code>.</li>
<li>Platform names are scrapli's own: <code>cisco_iosxe</code>, <code>arista_eos</code>, <code>juniper_junos</code> and two more.</li>
<li>Failures are typed exceptions under <code>ScrapliException</code>.</li>
<li>The lab keeps the API but not the real transport, timeouts or speed.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Is module mein aap wahi multivendor toolkit banaoge jo <code>adv-nkmiko</code> mein netmiko se banaya tha, par <b>scrapli</b> se: network devices ke liye ek chhoti, strict SSH library. Ant tak aap ek call se IOS XE, Junos aur Arista EOS par session khol sakoge, har command ka <code>Response</code> object padh sakoge, TextFSM se output parse kar sakoge, <code>send_configs</code> se configuration push karke wapas padh sakoge, teen timeouts mein farak bata sakoge, har scrapli exception ek nazar mein pehchan sakoge, aur samjha sakoge ki scrapli kab behtar tool hai aur netmiko kab.</p>
<p><b>Prerequisites.</b> <code>adv-nkmiko</code> (platform naam, prompts, paging, Junos par commit), <code>py-secrets</code> (environment variables aur .env files se passwords), <code>py-textfsm</code> (ntc-templates) aur <code>py-concurrency</code> (har thread ke liye ek connection). Heredoc aur <code>sed</code> ke liye Linux basics bhi chahiye.</p>

<h3>Analogy: receipt dene wala courier</h3>
<p>netmiko ek friendly receptionist hai: aap sawaal poochte ho aur shabdon mein jawab milta hai. Agar jawab error message hai, woh bhi bas shabd hain, aur use khud notice karna aapka kaam hai. scrapli ek <b>courier hai jo har parcel ki receipt deta hai</b>. Parcel command ka output hai, aur receipt, yaani <code>Response</code>, batati hai kya bheja gaya, kaun sa device bola, kitna time laga aur sabse zaroori, delivery <b>fail</b> hui ya nahi. Loop mein receipts check karna aasan hai, aur automation ko bilkul yahi chahiye.</p>

<h3>Layers</h3>
`+e(t,`Aapka code ek factory se baat karta hai. Driver platform jaanta hai, channel prompts jaanta hai, transport bytes le jaata hai. Har command Response ban kar wapas aati hai.`)+`
<p>Aap <code>cisco_iosxe</code> jaisi string se platform chunte ho, aur factory matching driver deti hai. <b>Driver</b> us platform ke privilege levels aur error strings jaanta hai. <b>Channel</b> prompt wapas aane tak padhta hai. <b>Transport</b> SSH carrier hai: real gear par default system OpenSSH client hota hai, aur use <code>ssh2</code>, <code>paramiko</code>, <code>asyncssh</code> ya telnet se badal sakte ho. Yehi choices scrapli ko real networks par fast aur flexible banate hain.</p>

<h3>scrapli aur netmiko ek nazar mein</h3>
<table class="cmp"><tr><th></th><th>netmiko</th><th>scrapli</th></tr>
<tr><td>Session kholna</td><td><code>ConnectHandler(device_type="cisco_ios", ...)</code></td><td><code>Scrapli(platform="cisco_iosxe", ...)</code></td></tr>
<tr><td>Credentials</td><td><code>username</code>, <code>password</code>, <code>secret</code></td><td><code>auth_username</code>, <code>auth_password</code>, <code>auth_secondary</code></td></tr>
<tr><td>Command kya lautati hai</td><td>ek plain string</td><td><code>.result</code> aur <code>.failed</code> wala <code>Response</code></td></tr>
<tr><td>Reject hui command</td><td>error text, koi flag nahi</td><td><code>failed=True</code> aur <code>raise_for_status()</code></td></tr>
<tr><td>Login ki failures</td><td>Netmiko exceptions</td><td>Scrapli exceptions, har wajah ke liye ek class</td></tr></table>
<p>Chapter 7 dono ko line-by-line compare karta hai aur decision rule par khatam hota hai.</p>

<h3>Lab network aur do labs</h3>
<p>AUTO01 (netadmin / Deccan@123) SW1 ke zariye 10.99.0.0/24 par teen devices tak pahunchta hai: IOS XE router <b>R1</b> (10.99.0.1, prompt <code>PUN-CORE-R1#</code>), Junos router <b>J1</b> (10.99.0.11, prompt <code>netops@J1&gt;</code>) aur Arista switch <b>E1</b> (10.99.0.21, prompt <code>E1#</code>). Login <code>netops</code> / <code>NK@2026</code> hai. Lab 1 configure lab hai, <i>scrapli toolkit: collect, configure, netmiko se compare</i>. Lab 2 troubleshoot lab hai, <i>chhe scrapli scripts jo fail hoti hain, ya us se bura, safal dikhti hain</i>. Chapters 2 se 7 Lab 1 chalate hain aur chapter 8 Lab 2.</p>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab asli scrapli API ko apne SSH transport ke upar chalata hai. <code>transport</code>, <code>transport_options</code>, <code>ssh_config_file</code>, <code>comms_prompt_pattern</code> aur <code>channel_log</code> arguments accept hote hain par ignore. Sirf paanch core platforms hain. Exception texts lab ke hain, asli library ke shabd nahi, aur lab mein asli clock nahi hai, isliye yahan speed nahi naap sakte. Jahan zaroori hoga hum yeh dobara kahenge. Jo aap likhoge woh real gear par bina badlaav chalega.</p></div>

<div class="warn"><p><b>Aam galti.</b> scrapli ko "doosre argument naamon wala netmiko" samajhna. Naam alag hain, par asli farak return value ka hai. Agar aap <code>.failed</code> ignore karte ho to scrapli use karne ki main wajah phenk dete ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Core platform naam hain <code>cisco_iosxe</code>, <code>cisco_iosxr</code>, <code>cisco_nxos</code>, <code>arista_eos</code> aur <code>juniper_junos</code>. <code>cisco_ios</code> netmiko ka naam hai; scrapli use nahi jaanta.</p></div>

<div class="scn"><h4>Woh backup jisne error save kiya</h4><p>Ek nightly job netmiko use karti thi aur <code>send_command</code> jo bhi lautata woh file mein likh deti. Command table mein typo ke baad teen routers ka "backup" do hafte tak <code>% Invalid input detected</code> text ke saath hota raha. Router marne tak kisi ne notice nahi kiya. scrapli wale rewrite mein file likhne se pehle <code>raise_for_status()</code> bulaya jaata hai, isliye job pehli raat hi zor se fail ho jaati.</p><p><b>Lesson:</b> library ki keemat is mein hai ki kuch galat hone par woh aapko kya batati hai.</p></div>

<div class="iv"><p class="q">"Netmiko ki jagah scrapli kyun chunoge?"</p><p>Kyunki har command ek Response lautati hai jisme failed flag aur timing hai, errors typed exceptions hain, transport badal sakte hain aur bade fleets ke liye async variant hai, aur API chhoti aur strict hai. Netmiko mein zyada platforms aur bada community hai, isliye quick one-off scripts aur un platforms ke liye jo scrapli cover nahi karta, main ab bhi netmiko chunta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>scrapli network devices ke liye chhoti SSH library hai: factory, driver, channel, transport.</li>
<li>Har command ek <code>Response</code> lautati hai; kai commands <code>MultiResponse</code> lautati hain.</li>
<li>Platform naam scrapli ke apne hain: <code>cisco_iosxe</code>, <code>arista_eos</code>, <code>juniper_junos</code> aur do aur.</li>
<li>Failures <code>ScrapliException</code> ke neeche typed exceptions hain.</li>
<li>Lab API rakhta hai par asli transport, timeouts ya speed nahi.</li>
</ul></div>
`}};export{n as default};