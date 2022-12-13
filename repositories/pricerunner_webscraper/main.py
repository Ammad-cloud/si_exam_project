import requests
from bs4 import BeautifulSoup
import sqlite3
import datetime


SCRAPE_ENDPOINT = 'https://www.pricerunner.dk'


def create_table(c):
    c.execute('''
        CREATE TABLE IF NOT EXISTS products(
            product_id INTEGER PRIMARY KEY, 
            product_url TEXT, 
            product_name TEXT, 
            product_subtitle TEXT, 
            product_price TEXT, 
            product_category TEXT,
            product_picture_url TEXT
            )
        ''')


def get_href_for_all_categories():
    soup = get_soup(SCRAPE_ENDPOINT)
    categories_list = soup.find_all(class_='yE113W5m69')
    categories_href_list = []
    for category in categories_list:
        anchor_tag = category.find('a')
        href = f'{SCRAPE_ENDPOINT}{anchor_tag["href"]}'
        categories_href_list.append(href)
    return categories_href_list


def get_href_sub_category(categories_href_list):
    sub_category_links = []
    for href in categories_href_list[1:]: # Skip the first category (black friday special page)
        soup = get_soup(href)
        div_center = soup.find_all('div')[7]
        list_items = div_center.find_all('li')
        for item in list_items:
            try: 
                href = item.find('a')['href']
                link = f'{SCRAPE_ENDPOINT}{href}?features=sale'
                category = href.split('/')[3].split('?')[0]
                sub_category_links.append({'category': category, 'link': link})
            except:
                pass
    return sub_category_links


def scrape(category):
    soup = get_soup(category['link'])
    item_section = soup.find(class_='mIkxpLfxgo pr-183umi2')
    if item_section is None:
        item_section = soup.find(class_='pr-f93q6r')
        item_list = item_section.find_all(class_='al5wsmjlcK')
        print(f'Found {len(item_list)} items in {category["category"]}')
    else:
        item_list = item_section.find_all(class_='k6oEmfY83J pr-6r3upd')
    item_list.append(category['category'])
    return item_list


def filter_data_and_save(c, item_list, category):
    for item in item_list:
        anchor_tag = item.find('a')
        if anchor_tag is not None:
            href = f'{SCRAPE_ENDPOINT}{anchor_tag["href"]}'
            product_subtitle = item.find('p').text
            product_name = item.find('h3').text
            price = item.find_all('span')[1].text.replace(u'\xa0', u' ')
            product_picture_url = item.find('img')['src']
            if 'data:image/svg+xml' in product_picture_url:
                product_picture_url = "N/A"
            c.execute("INSERT INTO products VALUES (NULL, ?, ?, ?, ?, ?, ?)",
                      (href, product_name, product_subtitle, price,
                       category, product_picture_url))


def bulk_scrape(c, conn, sub_category_links):
    no_sale_page_counter = 0
    with conn:
        for sub_cat in sub_category_links:
            try:
                data = scrape(sub_cat)
                filter_data_and_save(c, data[:-1], data[-1])
                print(f'Subcategory {sub_cat["category"]} fetched successfully')
            except Exception:
                no_sale_page_counter += 1
                print(f'Subcategory {sub_cat["category"]} did not have a sales page')
                pass
    return no_sale_page_counter
    

def print_data(c, sub_category_links, no_sale_page_counter):
    c.execute("SELECT * FROM products")
    fetched_items = c.fetchall()
    print(f'Found {len(fetched_items)} products')
    
    print(f"Successfully fetched {len(sub_category_links) - no_sale_page_counter}"
            f"/{len(sub_category_links)} subcategory pages")
    print('Finished scraping')

    count = 0
    for i in fetched_items:
        if i[6] == "N/A":
            count += 1
    print(f'Found {count} products without picture')


def get_soup(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    return soup
    

def main():
    date = datetime.datetime.now().strftime('%Y-%m-%d')
    db_file_path = f'products_file/products_{date}.db'
    conn = sqlite3.connect(db_file_path)
    c = conn.cursor()
    create_table(c)

    print('Starting scraping...')

    categories_href_list = get_href_for_all_categories()
    print(f'Found {len(categories_href_list)} categories')

    sub_category_links = get_href_sub_category(categories_href_list)
    print(f'Found {len(sub_category_links)} subcategories')

    no_sale_page_counter = bulk_scrape(c, conn, sub_category_links)

    print_data(c, sub_category_links, no_sale_page_counter)


main()
