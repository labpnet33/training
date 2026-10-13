var e={id:`merge-replace`,h:{en:`Merge versus replace: adding to a device or making it match`,hi:`Merge versus replace: device mein jodna ya use match karwana`},body:{en:`<p>NAPALM has two ways to load a candidate, and mixing them up is the most expensive mistake in this module. <code>load_merge_candidate</code> says "add this to what is there". <code>load_replace_candidate</code> says "this is the whole configuration; make the device look exactly like it". The first is polite. The second can delete a router.</p>

<h3>An analogy: the bookshelf</h3>
<p>Merge is putting one more book on a shelf: the other books stay. Replace is handing the librarian a list and saying "the shelf must hold exactly these books": every book not on the list is taken away. A good librarian shows you the list of books she will remove before she does it. That list is <code>compare_config()</code>.</p>

<h3>The rules</h3>
<table class="cmp"><tr><th></th><th>Merge</th><th>Replace</th></tr>
<tr><td>Candidate means</td><td>Lines to add or change</td><td>The complete configuration</td></tr>
<tr><td>Lines you leave out</td><td>Stay on the device</td><td>Are removed</td></tr>
<tr><td>Typical use</td><td>Add an NTP server, a peer, a VLAN</td><td>Drift correction from a golden configuration</td></tr>
<tr><td>Blast radius of a mistake</td><td>One extra line</td><td>Everything missing from the file</td></tr></table>
<p>How each driver does a replace (as the lab implements it):</p>
<ul>
<li><b>ios</b>: the driver computes the commands. A line on the device that is not in the candidate is removed with <code>no ...</code>; single-valued commands such as <code>description</code> are replaced, not negated. The real driver instead copies a file to flash and runs <code>configure replace</code>. The lab has no flash file system and no archive.</li>
<li><b>eos</b>: the candidate is turned into delta commands entered in a configuration session. A real switch can use <code>configure replace</code> with a file.</li>
<li><b>junos</b>: <code>load override</code> through PyEZ. The candidate is the whole configuration in text format.</li></ul>

<h3>The base of a replace: get_config</h3>
<p>You almost never write a whole configuration by hand. You read the running one, edit it in Python (or render a full template), and load the result. That makes <code>get_config(retrieve="running")["running"]</code> the starting point. Lab 1, step 6 drops every line that mentions <code>10.99.0.61</code> from the running text and previews the replace:</p>
<pre class="code">from ntpsync import candidate
from nkdev import DEVICES, open_device

for name in ("R1", "J1"):
    dev = open_device(name)
    running = dev.get_config(retrieve="running")["running"]
    dropped = "\\n".join(l for l in running.splitlines() if "10.99.0.61" not in l) + "\\n"
    dev.load_replace_candidate(config=dropped)
    print("%s: replace candidate without 10.99.0.61" % name)
    print(dev.compare_config())
    dev.discard_config()
    print("%s: still holds %s" % (name, sorted(dev.get_ntp_servers())))
    dev.close()

dev = open_device("R1")
dev.load_merge_candidate(config=candidate("ios", ["10.99.0.62"]))
for kwargs in ({"revert_in": 60}, {"message": "ntp"}):
    try:
        dev.commit_config(**kwargs)
    except NotImplementedError as err:
        print("R1 commit_config(%s): NotImplementedError: %s" % (list(kwargs)[0], err))
dev.discard_config()
dev.close()</pre>
<pre class="out">AUTO01$ python3 replace_preview.py
R1: replace candidate without 10.99.0.61
<span class="hl">-ntp server 10.99.0.61</span>
R1: still holds ['10.99.0.60', '10.99.0.61']
J1: replace candidate without 10.99.0.61
[edit system ntp]
<span class="hl">-   server 10.99.0.61;</span>
J1: still holds ['10.99.0.60', '10.99.0.61']
R1 commit_config(revert_in): NotImplementedError: Commit confirm has not been implemented on this platform.
R1 commit_config(message): NotImplementedError: Commit message not implemented for this platform</pre>
<p>The IOS diff has one removed line, the Junos diff one removed statement, and <code>still holds</code> proves that nothing was committed: the preview ended in <code>discard_config()</code>. Notice that this is a one-line difference because the candidate was the <em>whole</em> running configuration minus one line.</p>

<h3>The mistake: a replace with a short file</h3>
<p>Now imagine the candidate really is only <code>ntp server 10.99.0.60</code>, because someone loaded the wrong file. The device is asked to become that one line.</p>
<pre class="code">from nkdev import open_device

MAX_LINES = 10<span class="c">            # a replace that changes more lines than this needs a human</span>

dev = open_device("R1")
dev.load_replace_candidate(config="ntp server 10.99.0.60\\n")<span class="c">    # a "full" config that is far from full</span>
diff = dev.compare_config()
lines = diff.splitlines()
print("lines in the diff:", len(lines))
print("\\n".join(lines[:5]))
if len(lines) &gt; MAX_LINES:
    print("refusing to commit: %d lines is more than the %d we expect" % (len(lines), MAX_LINES))
    dev.discard_config()
dev.close()</pre>
<pre class="out">AUTO01$ python3 replace_guard.py
<span class="hl">lines in the diff: 42</span>
-version 2.0
-service timestamps debug datetime msec
-service timestamps log datetime msec
-no service password-encryption
-hostname PUN-CORE-R1
<span class="hl">refusing to commit: 42 lines is more than the 10 we expect</span></pre>
<p>The diff is 42 lines of removals: hostname, interfaces, BGP, the login. Committing it would cut the router off from the network. The guard in the script is five lines and worth its weight: <b>measure the diff before you commit a replace, and refuse when it is larger than you expect</b>. A merge usually needs no guard, a replace always does.</p>

<h3>Choosing between them</h3>
<table class="cmp"><tr><th>Situation</th><th>Use</th></tr>
<tr><td>Add one NTP server to 200 routers</td><td>merge, with a diff per device</td></tr>
<tr><td>Remove a server that must not be there</td><td>replace from the running text minus the line, or a targeted "no" line in a merge</td></tr>
<tr><td>Make every device equal to its golden file</td><td>replace, with a diff-size guard and a human review for the first run</td></tr>
<tr><td>Not sure</td><td>merge, because it cannot delete</td></tr></table>
<p>One caution for merge: it cannot remove, so "the device has an extra line" is invisible to it. That is exactly what the compliance reports of chapter 9 find.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab computes IOS and EOS replace as delta commands instead of using <code>configure replace</code>, so a real IOS XE router needs enough free flash and a working archive path; check before the change window. The idea, the diff and the danger are identical.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using replace to "add one line" with a hand-typed short file; replacing from a template that forgot management lines (SSH, the NETCONF or eAPI line, the login); never reading the diff of the first replace on a new device type.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which call removes configuration that is not in the file?" <code>load_replace_candidate</code>. Merge never removes lines, except that single-valued commands are overwritten.</p></div>

<div class="scn"><h4>The golden file with no management line</h4><p>A team built a golden file for Junos switches from a template and replaced the whole fleet over a weekend. The template lacked <code>set system services netconf ssh</code>, which they had added by hand years earlier. By Monday every NAPALM job failed with a refused connection on 830, and a console visit to each switch was needed. A diff-size guard and a read of the first diff would have shown the removed statement.</p><p><b>Lesson:</b> a replace is only as safe as its golden file; read the first diff and guard the size.</p></div>

<div class="iv"><p class="q">"When would you use replace instead of merge?"</p><p>When the device must equal a known good file: drift correction, rebuilding a device, or removing something merge cannot remove. I build the candidate from the running config or a full template, always read compare_config, and refuse the commit when the diff is larger than I expect.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Merge adds; replace makes the device equal to the candidate and removes the rest.</li>
<li>Build a replace from <code>get_config(retrieve="running")</code> or a full template.</li>
<li>Count the diff lines and refuse oversized replaces.</li>
<li>IOS and EOS replace are delta commands in the lab; Junos uses load override.</li>
<li>When unsure, merge.</li></ul></div>`,hi:`<p>NAPALM mein candidate load karne ke do tareeke hain, aur unhe mila dena is module ki sabse mehngi galti hai. <code>load_merge_candidate</code> kehta hai "jo wahan hai usme yeh jodo". <code>load_replace_candidate</code> kehta hai "yeh poori configuration hai; device ko bilkul aisa banao". Pehla vinamra hai. Doosra router ko mita sakta hai.</p>

<h3>Ek analogy: kitaab ki shelf</h3>
<p>Merge shelf par ek aur kitaab rakhna hai: baaki kitaabein rehti hain. Replace librarian ko list thama kar kehna hai "shelf par bilkul yehi kitaabein honi chahiye": jo kitaab list mein nahi hai woh hata di jaati hai. Achchi librarian hatane se pehle woh kitaabon ki list dikhati hai. Woh list <code>compare_config()</code> hai.</p>

<h3>Niyam</h3>
<table class="cmp"><tr><th></th><th>Merge</th><th>Replace</th></tr>
<tr><td>Candidate ka matlab</td><td>Jodne ya badalne wali lines</td><td>Poori configuration</td></tr>
<tr><td>Jo lines aap chhod do</td><td>Device par rehti hain</td><td>Hata di jaati hain</td></tr>
<tr><td>Aam use</td><td>NTP server, peer, VLAN jodna</td><td>Golden configuration se drift theek karna</td></tr>
<tr><td>Galti ka blast radius</td><td>Ek extra line</td><td>File mein jo missing hai woh sab</td></tr></table>
<p>Har driver replace kaise karta hai (jaisa lab implement karta hai):</p>
<ul>
<li><b>ios</b>: driver commands compute karta hai. Device par jo line candidate mein nahi hai woh <code>no ...</code> se hata di jaati hai; <code>description</code> jaise single-valued commands negate nahi balki replace hote hain. Asli driver file ko flash par copy karke <code>configure replace</code> chalata hai. Lab mein flash file system aur archive nahi hai.</li>
<li><b>eos</b>: candidate delta commands mein badal kar configuration session mein daala jaata hai. Asli switch file ke saath <code>configure replace</code> use kar sakta hai.</li>
<li><b>junos</b>: PyEZ ke through <code>load override</code>. Candidate text format mein poori configuration hai.</li></ul>

<h3>Replace ka base: get_config</h3>
<p>Aap poori configuration haath se shayad hi kabhi likhte ho. Running wali padhte ho, Python mein edit karte ho (ya poora template render karte ho), aur result load karte ho. Isliye <code>get_config(retrieve="running")["running"]</code> shuruaat hai. Lab 1, step 6 running text se <code>10.99.0.61</code> wali har line hata deta hai aur replace ka preview dikhata hai:</p>
<pre class="code">from ntpsync import candidate
from nkdev import DEVICES, open_device

for name in ("R1", "J1"):
    dev = open_device(name)
    running = dev.get_config(retrieve="running")["running"]
    dropped = "\\n".join(l for l in running.splitlines() if "10.99.0.61" not in l) + "\\n"
    dev.load_replace_candidate(config=dropped)
    print("%s: replace candidate without 10.99.0.61" % name)
    print(dev.compare_config())
    dev.discard_config()
    print("%s: still holds %s" % (name, sorted(dev.get_ntp_servers())))
    dev.close()

dev = open_device("R1")
dev.load_merge_candidate(config=candidate("ios", ["10.99.0.62"]))
for kwargs in ({"revert_in": 60}, {"message": "ntp"}):
    try:
        dev.commit_config(**kwargs)
    except NotImplementedError as err:
        print("R1 commit_config(%s): NotImplementedError: %s" % (list(kwargs)[0], err))
dev.discard_config()
dev.close()</pre>
<pre class="out">AUTO01$ python3 replace_preview.py
R1: replace candidate without 10.99.0.61
<span class="hl">-ntp server 10.99.0.61</span>
R1: still holds ['10.99.0.60', '10.99.0.61']
J1: replace candidate without 10.99.0.61
[edit system ntp]
<span class="hl">-   server 10.99.0.61;</span>
J1: still holds ['10.99.0.60', '10.99.0.61']
R1 commit_config(revert_in): NotImplementedError: Commit confirm has not been implemented on this platform.
R1 commit_config(message): NotImplementedError: Commit message not implemented for this platform</pre>
<p>IOS diff mein ek hata hua line hai, Junos diff mein ek hata hua statement, aur <code>still holds</code> saabit karta hai ki kuch commit nahi hua: preview <code>discard_config()</code> par khatam hua. Dhyan do ki yeh ek-line ka farq isliye hai kyunki candidate <em>poori</em> running configuration thi, ek line kam.</p>

<h3>Galti: chhoti file se replace</h3>
<p>Ab socho candidate sach mein sirf <code>ntp server 10.99.0.60</code> hai, kyunki kisi ne galat file load kar di. Device se kaha ja raha hai ki woh us ek line jaisa ban jaye.</p>
<pre class="code">from nkdev import open_device

MAX_LINES = 10<span class="c">            # a replace that changes more lines than this needs a human</span>

dev = open_device("R1")
dev.load_replace_candidate(config="ntp server 10.99.0.60\\n")<span class="c">    # a "full" config that is far from full</span>
diff = dev.compare_config()
lines = diff.splitlines()
print("lines in the diff:", len(lines))
print("\\n".join(lines[:5]))
if len(lines) &gt; MAX_LINES:
    print("refusing to commit: %d lines is more than the %d we expect" % (len(lines), MAX_LINES))
    dev.discard_config()
dev.close()</pre>
<pre class="out">AUTO01$ python3 replace_guard.py
<span class="hl">lines in the diff: 42</span>
-version 2.0
-service timestamps debug datetime msec
-service timestamps log datetime msec
-no service password-encryption
-hostname PUN-CORE-R1
<span class="hl">refusing to commit: 42 lines is more than the 10 we expect</span></pre>
<p>Diff 42 lines ke removals ka hai: hostname, interfaces, BGP, login. Ise commit karna router ko network se kaat deta. Script ka guard paanch lines ka hai aur kaafi keemti: <b>replace commit karne se pehle diff naapo, aur jab woh expected se bada ho to mana kar do</b>. Merge ko aam taur par guard nahi chahiye, replace ko hamesha.</p>

<h3>Dono mein se chunna</h3>
<table class="cmp"><tr><th>Sthiti</th><th>Use karo</th></tr>
<tr><td>200 routers mein ek NTP server jodna</td><td>merge, har device ke diff ke saath</td></tr>
<tr><td>Aisa server hatana jo wahan nahi hona chahiye</td><td>running text minus woh line se replace, ya merge mein targeted "no" line</td></tr>
<tr><td>Har device ko uski golden file ke barabar karna</td><td>replace, diff-size guard aur pehle run mein insaani review ke saath</td></tr>
<tr><td>Pakka nahi pata</td><td>merge, kyunki woh delete nahi kar sakta</td></tr></table>
<p>Merge ke liye ek saavdhani: woh hata nahi sakta, isliye "device par extra line hai" use dikhta hi nahi. Chapter 9 ki compliance reports yahi dhoondhti hain.</p>

<div class="note"><p><b>Lab mein vs asli gear par.</b> Lab IOS aur EOS replace ko <code>configure replace</code> ki jagah delta commands se compute karta hai, isliye asli IOS XE router ko kaafi free flash aur kaam karta archive path chahiye; change window se pehle check karo. Idea, diff aur khatra ek jaise hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "Ek line jodne" ke liye haath se likhi chhoti file ke saath replace use karna; aise template se replace karna jisme management lines bhool gayi (SSH, NETCONF ya eAPI line, login); naye device type par pehle replace ka diff kabhi na padhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> "File mein jo nahi hai woh configuration kaun si call hatati hai?" <code>load_replace_candidate</code>. Merge kabhi lines nahi hatata, sirf single-valued commands overwrite hote hain.</p></div>

<div class="scn"><h4>Management line ke bina golden file</h4><p>Ek team ne template se Junos switches ki golden file banayi aur weekend mein poora fleet replace kar diya. Template mein <code>set system services netconf ssh</code> nahi thi, jo unhone saalon pehle haath se jodi thi. Somvaar tak har NAPALM job 830 par refused connection se fail ho rahi thi, aur har switch par console visit chahiye thi. Diff-size guard aur pehle diff ka padhna hata hua statement dikha deta.</p><p><b>Lesson:</b> replace utna hi safe hai jitni uski golden file; pehla diff padho aur size guard lagao.</p></div>

<div class="iv"><p class="q">"Merge ki jagah replace kab use karoge?"</p><p>Jab device ko known good file ke barabar hona ho: drift correction, device dobara banana, ya woh hatana jo merge nahi hata sakta. Main candidate running config ya poore template se banata hoon, compare_config hamesha padhta hoon, aur diff expected se bada ho to commit mana kar deta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Merge jodta hai; replace device ko candidate ke barabar banata hai aur baaki hata deta hai.</li>
<li>Replace <code>get_config(retrieve="running")</code> ya poore template se banao.</li>
<li>Diff lines gino aur bade replace mana karo.</li>
<li>Lab mein IOS aur EOS replace delta commands hain; Junos load override use karta hai.</li>
<li>Shak ho to merge.</li></ul></div>`}};export{e as default};