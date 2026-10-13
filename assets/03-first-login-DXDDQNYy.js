var e={id:`first-login`,h:{en:`Your first script: log in and read one command`,hi:`Aapki pehli script: login karo aur ek command padho`},body:{en:`

<p>This chapter teaches one idea: <b>how a script logs in to one router and reads one command</b>. First we need four words of Python, and nothing more.</p>

<h3>Four words of Python</h3>
<ul>
<li>A <b>variable</b> is a name that holds a value, like a labelled box. <code>router_ip = "10.99.0.1"</code> puts the text 10.99.0.1 into a box called <code>router_ip</code>. The single <code>=</code> means "store", not "equals".</li>
<li>A <b>string</b> is text, always inside quotes: <code>"R1"</code>. An <b>integer</b> is a whole number, without quotes: <code>22</code>.</li>
<li>A <b>function</b> is a named action you start with brackets, like <code>print("hi")</code>. What you put inside the brackets are its <b>arguments</b>.</li>
<li>A <b>method</b> is a function that belongs to an object. You write <code>object.method()</code>. The dot means "ask this object to do this".</li>
</ul>
<p>Run this small file and read it top to bottom. The last line asks Python what <i>kind</i> of value each variable holds.</p>
<pre class="code">router_name = "R1"
router_ip = "10.99.0.1"
port = 22
print(router_name)
print(router_name, "is at", router_ip)
print("port plus one is", port + 1)
print(type(router_name), type(port))</pre>
<pre class="out">AUTO&gt; python3 basics.py
R1
R1 is at 10.99.0.1
<span class="hl">port plus one is 23</span>
&lt;class 'str'&gt; &lt;class 'int'&gt;</pre>
<p>Notice that <code>print()</code> with several values separates them with a space, and that <code>port + 1</code> was calculated because <code>port</code> is a number. Had <code>port</code> been the string <code>"22"</code>, adding 1 would fail, because Python does not guess.</p>

<h3>Your first login script</h3>
<p>Now the real script. Read it slowly; every line is explained below.</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(
    device_type="nk_ios",
    host="10.99.0.1",
    username="netops",
    password="NK@2026",
)
print("Logged in. Prompt is:", conn.find_prompt())
output = conn.send_command("show ip interface brief")
print(output)
conn.disconnect()</pre>
<ul>
<li><code>from nkmiko import ConnectHandler</code>: a <b>library</b> is code someone else wrote. <code>import</code> brings one tool from it into your script. <code>ConnectHandler</code> is the tool that opens SSH sessions. The real netmiko library works the same way.</li>
<li><code>conn = ConnectHandler( ... )</code>: calls the tool with four <b>named arguments</b> (written <code>name=value</code>) and stores the open session in the variable <code>conn</code>. The call spreads over several lines for readability; Python allows that inside brackets.</li>
<li><code>conn.find_prompt()</code>: asks the session "what is your prompt?" The answer is the string <code>R1#</code>.</li>
<li><code>conn.send_command("show ip interface brief")</code>: types the command on the router and <b>returns</b> everything it printed, as one long string. We store it in <code>output</code>.</li>
<li><code>print(output)</code>: shows that string.</li>
<li><code>conn.disconnect()</code>: closes the session politely. Always do this, because each open session uses one of the router's five vty lines.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Each named argument answers one question you would otherwise answer by typing it into an SSH client."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="10" width="190" height="40" rx="10" fill="#fde68a"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="14">device_type="nk_ios"</text><rect x="10" y="62" width="190" height="40" rx="10" fill="#fde68a"/><text x="105" y="87" text-anchor="middle" class="svg-ink" font-size="14">host="10.99.0.1"</text><rect x="10" y="114" width="190" height="40" rx="10" fill="#fde68a"/><text x="105" y="139" text-anchor="middle" class="svg-ink" font-size="14">username="netops"</text><rect x="10" y="166" width="190" height="40" rx="10" fill="#fde68a"/><text x="105" y="191" text-anchor="middle" class="svg-ink" font-size="14">password="NK@2026"</text><line x1="200" y1="30" x2="330" y2="30" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="200" y1="82" x2="330" y2="82" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="200" y1="134" x2="330" y2="134" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="200" y1="186" x2="330" y2="186" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="335" y="35" text-anchor="start" class="svg-ink" font-size="13">which command style the router speaks</text><text x="335" y="87" text-anchor="start" class="svg-ink" font-size="13">where to connect (the router IP)</text><text x="335" y="139" text-anchor="start" class="svg-ink" font-size="13">who is logging in</text><text x="335" y="191" text-anchor="start" class="svg-ink" font-size="13">proof of identity (lab value only)</text></svg><p class="cap">Each named argument answers one question you would otherwise answer by typing it into an SSH client.</p></div>

<h3>Run it</h3>
<pre class="out">AUTO&gt; python3 first.py
<span class="hl">Logged in. Prompt is: R1#</span>
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual up                    up
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down</pre>
<p>The output is exactly what you would see after typing the command yourself. The script did not "understand" it; it only fetched the text. That is why the next chapters teach you to <i>search</i> and <i>parse</i> text.</p>

<h3>What a failure looks like</h3>
<p>Change the password to <code>nk@2026</code> (wrong capital letters, because passwords are case-sensitive) and run again:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(
    device_type="nk_ios",
    host="10.99.0.1",
    username="netops",
    password="nk@2026",
)
print("never reached")</pre>
<pre class="out">AUTO&gt; python3 wrongpw.py
Traceback (most recent call last):
  File "wrongpw.py", line 3, in &lt;module&gt;
    conn = ConnectHandler(
<span class="hl">nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.</span>

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
...</pre>
<p>Read a <b>traceback</b> (Python's error report) from the <b>bottom</b>. The last line names the error: <code>NetmikoAuthenticationException</code>. Above it, Python shows which file and line failed. "Authentication" means the connection opened (port 22 was fine) but the login was refused. So the fix is the username or password, not the network.</p>

<div class="eg"><p><b>Worked example.</b> You want to know the IOS version of R1. You copy first.py, change the command to <code>"show version"</code>, run it, and read the answer. You did not learn anything new about Python; you reused the same four lines of login code with one different string. Most real scripts are this kind of small change to a known-good script.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Forgetting the quotes around text, which makes Python look for a variable of that name. (2) Writing <code>send_command</code> without the brackets, which only names the action but does not run it. (3) Never calling <code>disconnect()</code>. (4) Using <code>password="NK@2026"</code> in a script that others can read; here it is a lab value only.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_command()</code> is for <b>show</b> (exec) commands and returns text. Configuration lines go through <code>send_config_set()</code>, which you meet in Chapter 6. Also remember that <code>device_type</code> tells the library how to talk to the platform; a wrong value fails before any login.</p></div>

<div class="scn"><h4>The script that logged in to the wrong router</h4><p>An engineer copied a working script and changed only the command. The output looked odd: the hostname was R4, not R1. He had forgotten to change <code>host=</code>, so the script was talking to the router it had always talked to. Printing <code>conn.find_prompt()</code> at the start of every script would have shown the mistake at once.</p><p><b>Lesson:</b> make the script prove which device it is on before it does anything else.</p></div>

<div class="iv"><p class="q">"What is the difference between an authentication error and a timeout in an SSH script?"</p><p>A timeout means the TCP connection to port 22 was never established: wrong IP, no route, SSH not enabled, or a filter in the way. An authentication error means the connection worked but the credentials were refused. So I check reachability and SSH setup for the first, and username, password and login method for the second.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A variable stores a value, a string is text in quotes, a function does an action, a method is called with a dot.</li>
<li><code>ConnectHandler(...)</code> opens an SSH session; keep it in a variable such as <code>conn</code>.</li>
<li><code>send_command()</code> returns the router's output as one string.</li>
<li>Always <code>disconnect()</code>, and read tracebacks from the bottom line up.</li>
<li>Authentication error means login refused; timeout means the connection never opened.</li>
</ul></div>

`,hi:`

<p>Is chapter ka ek hi idea hai: <b>script ek router mein kaise login karta hai aur ek command kaise padhta hai</b>. Pehle humein Python ke chaar shabd chahiye, bas.</p>

<h3>Python ke chaar shabd</h3>
<ul>
<li><b>Variable</b> ek naam hai jo ek value pakadta hai, label lage dabbe ki tarah. <code>router_ip = "10.99.0.1"</code> text 10.99.0.1 ko <code>router_ip</code> naam ke dabbe mein rakhta hai. Akela <code>=</code> ka matlab "store karo" hai, "barabar hai" nahi.</li>
<li><b>String</b> text hai, hamesha quotes ke andar: <code>"R1"</code>. <b>Integer</b> poora number hai, bina quotes ke: <code>22</code>.</li>
<li><b>Function</b> ek naam wala action hai jise brackets se start karte ho, jaise <code>print("hi")</code>. Brackets ke andar jo daalte ho woh uske <b>arguments</b> hain.</li>
<li><b>Method</b> woh function hai jo kisi object ka hota hai. Aap <code>object.method()</code> likhte ho. Dot ka matlab "is object se yeh karwao".</li>
</ul>
<p>Yeh chhoti file chalao aur upar se neeche padho. Aakhri line Python se poochti hai ki har variable mein kis <i>kism</i> ki value hai.</p>
<pre class="code">router_name = "R1"
router_ip = "10.99.0.1"
port = 22
print(router_name)
print(router_name, "is at", router_ip)
print("port plus one is", port + 1)
print(type(router_name), type(port))</pre>
<pre class="out">AUTO&gt; python3 basics.py
R1
R1 is at 10.99.0.1
<span class="hl">port plus one is 23</span>
&lt;class 'str'&gt; &lt;class 'int'&gt;</pre>
<p>Dhyaan do ki kai values ke saath <code>print()</code> unhe ek space se alag karta hai, aur <code>port + 1</code> calculate hua kyunki <code>port</code> number hai. Agar <code>port</code> string <code>"22"</code> hota, to 1 jodna fail ho jaata, kyunki Python andaza nahi lagata.</p>

<h3>Aapki pehli login script</h3>
<p>Ab asli script. Dheere padho; har line neeche explain ki gayi hai.</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(
    device_type="nk_ios",
    host="10.99.0.1",
    username="netops",
    password="NK@2026",
)
print("Logged in. Prompt is:", conn.find_prompt())
output = conn.send_command("show ip interface brief")
print(output)
conn.disconnect()</pre>
<ul>
<li><code>from nkmiko import ConnectHandler</code>: <b>library</b> woh code hai jo kisi aur ne likha. <code>import</code> usme se ek tool aapki script mein laata hai. <code>ConnectHandler</code> woh tool hai jo SSH sessions kholta hai. Asli netmiko library bhi isi tarah kaam karti hai.</li>
<li><code>conn = ConnectHandler( ... )</code>: tool ko chaar <b>named arguments</b> (<code>name=value</code> likhe hue) ke saath call karta hai aur khula session variable <code>conn</code> mein rakhta hai. Padhne mein aasani ke liye call kai lines mein phaila hai; Python brackets ke andar yeh allow karta hai.</li>
<li><code>conn.find_prompt()</code>: session se poochta hai "tumhara prompt kya hai?" Jawab string <code>R1#</code> hai.</li>
<li><code>conn.send_command("show ip interface brief")</code>: router par command type karta hai aur jo kuch router ne print kiya woh sab ek lambi string ke roop mein <b>return</b> karta hai. Hum use <code>output</code> mein rakhte hain.</li>
<li><code>print(output)</code>: woh string dikhata hai.</li>
<li><code>conn.disconnect()</code>: session tameez se band karta hai. Hamesha karo, kyunki har khula session router ki paanch vty lines mein se ek use karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Har named argument ek sawaal ka jawab hai jo aap warna SSH client mein type karke dete."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="10" width="190" height="40" rx="10" fill="#fde68a"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="14">device_type="nk_ios"</text><rect x="10" y="62" width="190" height="40" rx="10" fill="#fde68a"/><text x="105" y="87" text-anchor="middle" class="svg-ink" font-size="14">host="10.99.0.1"</text><rect x="10" y="114" width="190" height="40" rx="10" fill="#fde68a"/><text x="105" y="139" text-anchor="middle" class="svg-ink" font-size="14">username="netops"</text><rect x="10" y="166" width="190" height="40" rx="10" fill="#fde68a"/><text x="105" y="191" text-anchor="middle" class="svg-ink" font-size="14">password="NK@2026"</text><line x1="200" y1="30" x2="330" y2="30" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="200" y1="82" x2="330" y2="82" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="200" y1="134" x2="330" y2="134" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="200" y1="186" x2="330" y2="186" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="335" y="35" text-anchor="start" class="svg-ink" font-size="13">router kaunsi command style bolta hai</text><text x="335" y="87" text-anchor="start" class="svg-ink" font-size="13">kahan connect karna hai (router ka IP)</text><text x="335" y="139" text-anchor="start" class="svg-ink" font-size="13">kaun login kar raha hai</text><text x="335" y="191" text-anchor="start" class="svg-ink" font-size="13">pehchaan ka saboot (sirf lab value)</text></svg><p class="cap">Har named argument ek sawaal ka jawab hai jo aap warna SSH client mein type karke dete.</p></div>

<h3>Chalao</h3>
<pre class="out">AUTO&gt; python3 first.py
<span class="hl">Logged in. Prompt is: R1#</span>
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual up                    up
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down</pre>
<p>Output bilkul wahi hai jo aap khud command type karke dekhte. Script ne use "samjha" nahi; usne sirf text laya. Isiliye agle chapters aapko text ko <i>search</i> aur <i>parse</i> karna sikhate hain.</p>

<h3>Failure kaisa dikhta hai</h3>
<p>Password ko <code>nk@2026</code> kar do (capital letters galat, kyunki passwords case-sensitive hote hain) aur dobara chalao:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(
    device_type="nk_ios",
    host="10.99.0.1",
    username="netops",
    password="nk@2026",
)
print("never reached")</pre>
<pre class="out">AUTO&gt; python3 wrongpw.py
Traceback (most recent call last):
  File "wrongpw.py", line 3, in &lt;module&gt;
    conn = ConnectHandler(
<span class="hl">nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.</span>

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
...</pre>
<p><b>Traceback</b> (Python ki error report) ko <b>neeche se</b> padho. Aakhri line error ka naam batati hai: <code>NetmikoAuthenticationException</code>. Uske upar Python dikhata hai ki kaunsi file aur line fail hui. "Authentication" ka matlab connection khula (port 22 theek tha) par login mana ho gaya. To fix username ya password hai, network nahi.</p>

<div class="eg"><p><b>Worked example.</b> Aapko R1 ka IOS version jaanna hai. Aap first.py copy karte ho, command ko <code>"show version"</code> kar dete ho, chalate ho aur jawab padhte ho. Aapne Python ke baare mein kuch naya nahi seekha; bas login code ki wahi chaar lines ek alag string ke saath dobara use ki. Zyadatar asli scripts kisi known-good script mein aise hi chhote change hote hain.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Text ke aaspaas quotes bhool jaana, jisse Python us naam ka variable dhoondhta hai. (2) <code>send_command</code> brackets ke bina likhna, jo sirf action ka naam leta hai par chalata nahi. (3) <code>disconnect()</code> kabhi call na karna. (4) Aisi script mein <code>password="NK@2026"</code> likhna jo doosre padh sakte hain; yahan yeh sirf lab value hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_command()</code> <b>show</b> (exec) commands ke liye hai aur text return karta hai. Configuration lines <code>send_config_set()</code> se jaati hain, jo aap Chapter 6 mein milenge. Yeh bhi yaad rakho ki <code>device_type</code> library ko batata hai ki platform se kaise baat kare; galat value login se pehle hi fail hoti hai.</p></div>

<div class="scn"><h4>Woh script jo galat router mein login kar gayi</h4><p>Ek engineer ne chalti hui script copy ki aur sirf command badli. Output ajeeb tha: hostname R4 tha, R1 nahi. Woh <code>host=</code> badalna bhool gaya tha, isliye script usi router se baat kar rahi thi jisse hamesha karti thi. Har script ke shuru mein <code>conn.find_prompt()</code> print karne se galti turant dikh jaati.</p><p><b>Lesson:</b> script ko kuch bhi karne se pehle saabit karne do ki woh kis device par hai.</p></div>

<div class="iv"><p class="q">"SSH script mein authentication error aur timeout mein kya farak hai?"</p><p>Timeout ka matlab port 22 par TCP connection kabhi bana hi nahi: galat IP, route nahi, SSH enable nahi, ya beech mein filter. Authentication error ka matlab connection chala par credentials mane nahi gaye. Isliye pehle ke liye main reachability aur SSH setup check karta hoon, aur doosre ke liye username, password aur login method.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variable value store karta hai, string quotes mein text hai, function action karta hai, method dot se call hota hai.</li>
<li><code>ConnectHandler(...)</code> SSH session kholta hai; use <code>conn</code> jaise variable mein rakho.</li>
<li><code>send_command()</code> router ka output ek string ke roop mein return karta hai.</li>
<li>Hamesha <code>disconnect()</code> karo, aur tracebacks neeche ki line se upar padho.</li>
<li>Authentication error matlab login mana; timeout matlab connection kabhi khula hi nahi.</li>
</ul></div>

`}};export{e as default};