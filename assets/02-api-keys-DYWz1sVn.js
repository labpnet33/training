var e={id:`api-keys`,h:{en:`API keys and accounts: keygen, X-PAN-KEY and keeping the key out of sight`,hi:`API keys aur accounts: keygen, X-PAN-KEY aur key ko nazar se door rakhna`},body:{en:`
<p>A password is a master key. An <b>API key</b> is a visitor badge: you swap the password for it once, and from then on scripts show the badge, not the password. If a badge leaks you replace it; if a password leaks you replace it everywhere it was reused. This chapter is Lab 1 task 1: get a key, store it safely and never print it.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="diagram">
<rect x="8" y="20" width="120" height="56" rx="10" fill="#bae6fd"/><text x="68" y="45" text-anchor="middle" class="svg-ink" font-size="13">user + password</text><text x="68" y="62" text-anchor="middle" class="svg-muted" font-size="11">typed or from a vault</text>
<rect x="160" y="20" width="120" height="56" rx="10" fill="#ddd6fe"/><text x="220" y="45" text-anchor="middle" class="svg-ink" font-size="13">type=keygen</text><text x="220" y="62" text-anchor="middle" class="svg-muted" font-size="11">POST, not in the URL</text>
<rect x="312" y="20" width="120" height="56" rx="10" fill="#fde68a"/><text x="372" y="45" text-anchor="middle" class="svg-ink" font-size="13">API key</text><text x="372" y="62" text-anchor="middle" class="svg-muted" font-size="11">a long secret string</text>
<rect x="464" y="20" width="168" height="56" rx="10" fill="#bbf7d0"/><text x="548" y="45" text-anchor="middle" class="svg-ink" font-size="13">.env  (mode 600)</text><text x="548" y="62" text-anchor="middle" class="svg-muted" font-size="11">PAN_API_KEY=...</text>
<line x1="128" y1="48" x2="160" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="48" x2="312" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="432" y1="48" x2="464" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="312" y="110" width="168" height="50" rx="10" fill="#fed7aa"/><text x="396" y="132" text-anchor="middle" class="svg-ink" font-size="13">os.environ</text><text x="396" y="149" text-anchor="middle" class="svg-muted" font-size="11">real variable wins over .env</text>
<rect x="512" y="110" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="572" y="132" text-anchor="middle" class="svg-ink" font-size="13">X-PAN-KEY</text><text x="572" y="149" text-anchor="middle" class="svg-muted" font-size="11">header on every call</text>
<line x1="548" y1="76" x2="396" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="135" x2="512" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="100" y="140" text-anchor="middle" class="svg-accent" font-size="13">never print the key</text>
</svg><p class="cap">The key is asked for once, stored with owner-only rights and sent in a header, never printed.</p></div>

<h3>Who gets a key: accounts and roles</h3>
<p>A key belongs to an administrator account and carries that account's rights. So the first decision is the account. Do not automate with the built-in <code>admin</code>; create one account per tool, so you can see in the logs who did what and can switch it off alone. PAN-OS has four built-in roles you will meet in this module:</p>
<table class="cmp"><tr><th>Role</th><th>Can read</th><th>Can write</th><th>Typical use</th></tr>
<tr><td><code>superuser</code></td><td>yes</td><td>yes</td><td>Break-glass admin; the lab uses it for simplicity</td></tr>
<tr><td><code>superreader</code></td><td>yes</td><td>no</td><td>Auditors, inventory scripts</td></tr>
<tr><td><code>deviceadmin</code></td><td>yes</td><td>yes (no admin accounts)</td><td>Firewall engineers</td></tr>
<tr><td><code>devicereader</code></td><td>yes</td><td>no</td><td>Monitoring</td></tr></table>
<p>On real firewalls a production automation account normally gets a <b>custom Admin Role profile</b> with only the XML API privileges it needs and the web and CLI access switched off. The lab knows the four built-in roles only.</p>

<h3>Asking for the key</h3>
<p>The request is <code>type=keygen</code> with <code>user</code> and <code>password</code>. Send it with <b>POST</b>, so the password travels in the body and not in a URL that proxies and access logs keep. The answer is a small XML document with the key in <code>result/key</code>. Look at the first line of a PAN-OS reply: it really is written <code>status = 'success'</code>, with spaces and single quotes. A real XML parser does not care.</p>
<pre class="code">"""keygen.py - ask the firewall for an API key and keep it in .env (never print it)"""
import os
import xml.etree.ElementTree as ET

import requests

from panconf import BASE

user = os.environ["PAN_USER"]
password = os.environ["PAN_PASSWORD"]
reply = requests.post(BASE, data={"type": "keygen", "user": user, "password": password}, verify=False, timeout=10)
root = ET.fromstring(reply.text)
if root.get("status") != "success":
    raise SystemExit("keygen failed for %s: H&#84;TP %s %s" % (user, reply.status_code, root.findtext(".//msg")))
key = root.findtext("./result/key")
with open(".env", "w") as f:
    f.write("PAN_API_KEY=%s\\n" % key)
os.chmod(".env", 0o600)
print("PAN_API_KEY saved to .env (%d characters)" % len(key))</pre>
<p>Read the script as a list of habits. The credentials come from the environment (<code>PAN_USER</code>, <code>PAN_PASSWORD</code>), not from the code. A failure stops the script with the firewall's own words. The key goes into <code>.env</code> with mode 600, so only your user can read it, and the only thing printed is its <b>length</b>.</p>
<pre class="code">export PAN_USER=admin
export PAN_PASSWORD=admin
python3 keygen.py
ls -l .env</pre>
<pre class="out">AUTO01$ python3 keygen.py
PAN_API_KEY saved to .env (95 characters)</pre>
<pre class="out">AUTO01$ ls -l .env
<span class="hl">-rw-------  1 netadmin netadmin    108 Sep 29 09:00 .env</span></pre>

<h3>Where the key lives, and who wins</h3>
<p><code>panconf.py</code> calls <code>load_dotenv()</code>, which copies the lines of <code>.env</code> into <code>os.environ</code>, and then every script asks <code>api_key()</code>. One rule matters: <code>load_dotenv()</code> does <b>not</b> override a variable that already exists in the real environment. That is useful. You can run one command with a different key without editing a file:</p>
<pre class="code">PAN_PASSWORD=wrong python3 keygen.py; echo "exit code: $?"</pre>
<pre class="out">AUTO01$ PAN_PASSWORD=wrong python3 keygen.py; echo "exit code: $?"
<span class="hl">keygen failed for admin: H&#84;TP 403 Invalid credentials.</span>
exit code: 1</pre>
<p>Two different wrong things sound alike. A wrong <b>password</b> at keygen gives <code>Invalid credentials.</code>; a wrong <b>key</b> on any later call gives <code>Invalid Credential</code>. Both come back with H&#84;TP 403, which is one of the few places PAN-OS uses the H&#84;TP status for an error.</p>

<h3>Header, not URL</h3>
<p>The key can be sent as a <code>key=</code> parameter or in the <code>X-PAN-KEY</code> header. Use the header: URLs end up in logs, shell history and browser caches. Our helper in the next chapter always sends the header.</p>

<div class="eg"><p><b>Worked example.</b> The key is 95 characters long in the lab. Your script must not rely on that number; it is printed here only to prove that a key exists without showing it. Real keys are of a different length and can change after a PAN-OS upgrade or an account password change, so never validate a key by its length.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab accepts the built-in <code>admin</code> / <code>admin</code> and lets you create more accounts through the API. On real gear you also choose the lifetime of keys (Device, Setup, Management) and an old key stops working when its account password changes. The lab keeps issued keys valid until the firewall restarts.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Putting the key (or <code>PAN_PASSWORD</code>) in the script "just for now". Printing the key to check it. Committing <code>.env</code> to Git: add it to <code>.gitignore</code> before the first commit. Sending keygen with GET, so the password is in a URL.</p></div>
<div class="exam"><p><b>Exam trap.</b> The key is bound to the account. A key from a read-only account lets you read everything and fail on the first write (you will see code 16 in chapter 9). A key does not choose its own rights.</p></div>

<div class="scn"><h4>The key in the ticket</h4><p>An engineer pasted a script into a ticket to ask for help. The script had the API key of a superuser account in a variable. The ticket system was readable by two hundred people and by a vendor. The firewall team had to change that account's password, which invalidated the key, and then find every job that used it. Had the script read <code>PAN_API_KEY</code> from the environment, the paste would have been harmless.</p><p><b>Lesson:</b> a script is something you share; a key is something you do not.</p></div>

<div class="iv"><p class="q">"How do you authenticate an automation script to a Palo Alto firewall without hard-coding a password?"</p><p>A dedicated account with a minimal role, one <code>type=keygen</code> POST to swap its password for an API key, and the key kept in a protected store: an environment variable or a mode-600 <code>.env</code> outside Git, or a vault. Every call sends it in the <code>X-PAN-KEY</code> header, and the script never prints it. I rotate it by changing the account password.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Swap the password for a key once with <code>type=keygen</code> (POST); scripts then send the key.</li>
<li>One account per tool, with the smallest role that works.</li>
<li>Key in the environment or a mode-600 <code>.env</code>; send it in the <code>X-PAN-KEY</code> header; never print it.</li>
<li><code>load_dotenv()</code> does not override a real environment variable.</li>
<li>403 with <code>Invalid credentials.</code> is a bad password at keygen; <code>Invalid Credential</code> is a bad key.</li>
</ul></div>
`,hi:`
<p>Password master key hai. <b>API key</b> visitor badge hai: aap password ke badle ek baar badge lete ho, aur uske baad scripts badge dikhati hain, password nahi. Badge leak ho to badla jaata hai; password leak ho to jahan jahan reuse hua wahan badalna padta hai. Yeh chapter Lab 1 ka task 1 hai: key lo, use safely store karo aur kabhi print mat karo.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="diagram">
<rect x="8" y="20" width="120" height="56" rx="10" fill="#bae6fd"/><text x="68" y="45" text-anchor="middle" class="svg-ink" font-size="13">user + password</text><text x="68" y="62" text-anchor="middle" class="svg-muted" font-size="11">type ya vault se</text>
<rect x="160" y="20" width="120" height="56" rx="10" fill="#ddd6fe"/><text x="220" y="45" text-anchor="middle" class="svg-ink" font-size="13">type=keygen</text><text x="220" y="62" text-anchor="middle" class="svg-muted" font-size="11">POST, URL mein nahi</text>
<rect x="312" y="20" width="120" height="56" rx="10" fill="#fde68a"/><text x="372" y="45" text-anchor="middle" class="svg-ink" font-size="13">API key</text><text x="372" y="62" text-anchor="middle" class="svg-muted" font-size="11">lambi secret string</text>
<rect x="464" y="20" width="168" height="56" rx="10" fill="#bbf7d0"/><text x="548" y="45" text-anchor="middle" class="svg-ink" font-size="13">.env  (mode 600)</text><text x="548" y="62" text-anchor="middle" class="svg-muted" font-size="11">PAN_API_KEY=...</text>
<line x1="128" y1="48" x2="160" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="48" x2="312" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="432" y1="48" x2="464" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="312" y="110" width="168" height="50" rx="10" fill="#fed7aa"/><text x="396" y="132" text-anchor="middle" class="svg-ink" font-size="13">os.environ</text><text x="396" y="149" text-anchor="middle" class="svg-muted" font-size="11">asli variable .env se upar</text>
<rect x="512" y="110" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="572" y="132" text-anchor="middle" class="svg-ink" font-size="13">X-PAN-KEY</text><text x="572" y="149" text-anchor="middle" class="svg-muted" font-size="11">har call par header</text>
<line x1="548" y1="76" x2="396" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="135" x2="512" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="100" y="140" text-anchor="middle" class="svg-accent" font-size="13">key kabhi print mat karo</text>
</svg><p class="cap">Key ek baar maangi jaati hai, sirf owner ke rights ke saath store hoti hai aur header mein jaati hai, kabhi print nahi hoti.</p></div>

<h3>Key kise milti hai: accounts aur roles</h3>
<p>Key ek administrator account ki hoti hai aur usi account ke rights saath rakhti hai. Isliye pehla faisla account ka hai. Automation ke liye built-in <code>admin</code> use mat karo; har tool ke liye ek account banao, taaki logs mein dikhe kisne kya kiya aur use akela band kiya ja sake. PAN-OS ke chaar built-in roles hain jo is module mein milenge:</p>
<table class="cmp"><tr><th>Role</th><th>Padh sakta hai</th><th>Likh sakta hai</th><th>Aam use</th></tr>
<tr><td><code>superuser</code></td><td>haan</td><td>haan</td><td>Break-glass admin; lab sadgi ke liye yahi use karta hai</td></tr>
<tr><td><code>superreader</code></td><td>haan</td><td>nahi</td><td>Auditors, inventory scripts</td></tr>
<tr><td><code>deviceadmin</code></td><td>haan</td><td>haan (admin accounts nahi)</td><td>Firewall engineers</td></tr>
<tr><td><code>devicereader</code></td><td>haan</td><td>nahi</td><td>Monitoring</td></tr></table>
<p>Asli firewalls par production automation account ko aam taur par ek <b>custom Admin Role profile</b> milta hai jisme sirf zaroori XML API privileges hote hain aur web aur CLI access band hota hai. Lab sirf chaar built-in roles jaanta hai.</p>

<h3>Key maangna</h3>
<p>Request <code>type=keygen</code> hai, saath mein <code>user</code> aur <code>password</code>. Ise <b>POST</b> se bhejo, taaki password body mein jaaye, us URL mein nahi jise proxies aur access logs sambhal kar rakhte hain. Jawab ek chhota XML document hai jisme key <code>result/key</code> mein hoti hai. PAN-OS reply ki pehli line dekho: woh sach mein <code>status = 'success'</code> likhi aati hai, spaces aur single quotes ke saath. Asli XML parser ko isse farak nahi padta.</p>
<pre class="code">"""keygen.py - ask the firewall for an API key and keep it in .env (never print it)"""
import os
import xml.etree.ElementTree as ET

import requests

from panconf import BASE

user = os.environ["PAN_USER"]
password = os.environ["PAN_PASSWORD"]
reply = requests.post(BASE, data={"type": "keygen", "user": user, "password": password}, verify=False, timeout=10)
root = ET.fromstring(reply.text)
if root.get("status") != "success":
    raise SystemExit("keygen failed for %s: H&#84;TP %s %s" % (user, reply.status_code, root.findtext(".//msg")))
key = root.findtext("./result/key")
with open(".env", "w") as f:
    f.write("PAN_API_KEY=%s\\n" % key)
os.chmod(".env", 0o600)
print("PAN_API_KEY saved to .env (%d characters)" % len(key))</pre>
<p>Script ko aadaton ki list ki tarah padho. Credentials environment se aate hain (<code>PAN_USER</code>, <code>PAN_PASSWORD</code>), code se nahi. Failure par script firewall ke apne shabdon ke saath ruk jaati hai. Key <code>.env</code> mein mode 600 ke saath jaati hai, yaani sirf aapka user padh sakta hai, aur jo kuch print hota hai woh sirf uski <b>lambai</b> hai.</p>
<pre class="code">export PAN_USER=admin
export PAN_PASSWORD=admin
python3 keygen.py
ls -l .env</pre>
<pre class="out">AUTO01$ python3 keygen.py
PAN_API_KEY saved to .env (95 characters)</pre>
<pre class="out">AUTO01$ ls -l .env
<span class="hl">-rw-------  1 netadmin netadmin    108 Sep 29 09:00 .env</span></pre>

<h3>Key kahan rehti hai, aur kaun jeetta hai</h3>
<p><code>panconf.py</code> <code>load_dotenv()</code> bulata hai, jo <code>.env</code> ki lines ko <code>os.environ</code> mein copy karta hai, phir har script <code>api_key()</code> se key maangti hai. Ek niyam zaroori hai: <code>load_dotenv()</code> asli environment mein pehle se maujood variable ko <b>override nahi</b> karta. Yeh kaam ki baat hai. Aap file badle bina ek command ko alag key de sakte ho:</p>
<pre class="code">PAN_PASSWORD=wrong python3 keygen.py; echo "exit code: $?"</pre>
<pre class="out">AUTO01$ PAN_PASSWORD=wrong python3 keygen.py; echo "exit code: $?"
<span class="hl">keygen failed for admin: H&#84;TP 403 Invalid credentials.</span>
exit code: 1</pre>
<p>Do alag galtiyan ek jaisi sunai deti hain. Keygen par galat <b>password</b> <code>Invalid credentials.</code> deta hai; baad ki kisi bhi call par galat <b>key</b> <code>Invalid Credential</code> deti hai. Dono H&#84;TP 403 ke saath aate hain, jo un kuch jagahon mein se hai jahan PAN-OS error ke liye H&#84;TP status use karta hai.</p>

<h3>Header, URL nahi</h3>
<p>Key <code>key=</code> parameter ke roop mein ya <code>X-PAN-KEY</code> header mein bheji ja sakti hai. Header use karo: URLs logs, shell history aur browser cache mein pahunch jaate hain. Agle chapter ka hamara helper hamesha header bhejta hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab mein key 95 characters ki hai. Aapki script is number par nirbhar nahi honi chahiye; yahan sirf yeh dikhane ke liye print hua hai ki key maujood hai, use dikhaye bina. Asli keys alag lambai ki hoti hain aur PAN-OS upgrade ya account password badalne par badal sakti hain, isliye key ko uski lambai se kabhi validate mat karo.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> Lab built-in <code>admin</code> / <code>admin</code> accept karta hai aur API se aur accounts banane deta hai. Asli gear par aap keys ki lifetime bhi chunte ho (Device, Setup, Management) aur account password badalne par purani key kaam karna band kar deti hai. Lab jaari ki hui keys ko firewall restart hone tak valid rakhta hai.</p></div>
<div class="warn"><p><b>Aam galtiyan.</b> Key (ya <code>PAN_PASSWORD</code>) ko "abhi ke liye" script mein rakh dena. Key check karne ke liye print kar dena. <code>.env</code> ko Git mein commit kar dena: pehle commit se pehle use <code>.gitignore</code> mein daalo. Keygen ko GET se bhejna, jisse password URL mein aa jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Key account se bandhi hoti hai. Read-only account ki key sab kuch padhne deti hai aur pehle write par fail hoti hai (chapter 9 mein code 16 dikhega). Key apne rights khud nahi chunti.</p></div>

<div class="scn"><h4>Ticket mein key</h4><p>Ek engineer ne madad maangne ke liye ticket mein script paste kar di. Script mein ek superuser account ki API key variable mein thi. Ticket system do sau logon aur ek vendor ko dikhta tha. Firewall team ko us account ka password badalna pada, jisse key invalid ho gayi, aur phir har job dhoondhni padi jo use use karti thi. Agar script <code>PAN_API_KEY</code> environment se padhti, to paste bekaar hota.</p><p><b>Lesson:</b> script woh cheez hai jo share hoti hai; key woh cheez hai jo share nahi hoti.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall par automation script ko bina password hard-code kiye authenticate kaise karoge?"</p><p>Chhote role wala dedicated account, password ke badle API key lene ke liye ek <code>type=keygen</code> POST, aur key protected jagah par: environment variable ya Git ke bahar mode-600 <code>.env</code>, ya vault. Har call usse <code>X-PAN-KEY</code> header mein bhejti hai, aur script use kabhi print nahi karti. Rotate karne ke liye account ka password badalta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Password ke badle ek baar <code>type=keygen</code> (POST) se key lo; scripts phir key bhejti hain.</li>
<li>Har tool ke liye ek account, sabse chhote kaam karne wale role ke saath.</li>
<li>Key environment ya mode-600 <code>.env</code> mein; <code>X-PAN-KEY</code> header mein bhejo; kabhi print mat karo.</li>
<li><code>load_dotenv()</code> asli environment variable ko override nahi karta.</li>
<li><code>Invalid credentials.</code> ke saath 403 keygen par galat password hai; <code>Invalid Credential</code> galat key hai.</li>
</ul></div>
`}};export{e as default};