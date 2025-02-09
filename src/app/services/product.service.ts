import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { GeneratedImage, Product, ProductDescription, SocialPromoContent } from '../types';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private supabase = this.authService.getSupabaseClient();

  constructor(private authService: AuthService) {}
/*
  // Product methods
  getProducts(): Observable<Product[]> {
    return from(
      this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Product[];
      })
    );
  }
  */
  getProducts(): Observable<Product[]> {
    return from(
      this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Product[];
        })
    );
  }
  
  getProductsByIds(productIds: string[]): Observable<Product[]> {
    return from(
      this.supabase
        .from('products')
        .select('*')
        .in('id', productIds)  // Fetch products by their IDs
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Product[];
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => new Error('Failed to fetch products.'));
      })
    );
  }
  /*
  addProduct(product: { name: string; description: string; price: number }): Observable<Product> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) throw new Error('User not authenticated');
        return user;
      }),
      map(user => ({
        ...product,
        user_id: user.id
      })),
      map(productWithUser => 
        from(
          this.supabase
            .from('products')
            .insert([productWithUser])
            .select()
            .single()
        )
      ),
      map(response => {
        const { data, error } = response;
        if (error) throw error;
        return data as Product;
      })
    );
  }
  */
  addProduct(product: { name: string; description: string; price: number }): Observable<Product> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) throw new Error('User not authenticated');
        return { ...product, user_id: user.id };
      }),
      mergeMap(productWithUser => 
        from(
          this.supabase
            .from('products')
            .insert([productWithUser])
            .select()
            .single()
        )
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return data as Product;
      })
    );
  }
  /*
  updateProduct(id: string, product: { name: string; description: string; price: number }): Observable<Product> {
    return from(
      this.supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Product;
      })
    );
  }
  */
  updateProduct(id: string, product: { name: string; description: string; price: number }): Observable<Product> {
    return from(
      this.supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Product;
        })
    );
  }

  deleteProduct(id: string): Observable<void> {
    return from(
      this.supabase
        .from('products')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  // Keep all existing methods for ProductDescription, SocialPromoContent, and GeneratedImage
  getProductDescriptions(): Observable<ProductDescription[]> {
    return from(
      this.supabase
        .from('product_descriptions')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductDescription[];
      })
    );
  }
/*
  addProductDescription(name: string, details: string, tone: string): Observable<ProductDescription> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) throw new Error('User not authenticated');
        return user;
      }),
      map(user => ({
        name,
        details,
        tone,
        user_id: user.id,
        generated_description: `Generated description for ${name}`
      })),
      map(descriptionData => 
        from(
          this.supabase
            .from('product_descriptions')
            .insert([descriptionData])
            .select()
            .single()
        )
      ),
      map(response => {
        const { data, error } = response;
        if (error) throw error;
        return data as ProductDescription;
      })
    );
  }
*/
addProductDescription(name: string, details: string, tone: string): Observable<ProductDescription> {
  return this.authService.getCurrentUser().pipe(
    mergeMap(user => {
      if (!user) return throwError(() => new Error('User not authenticated'));

      const descriptionData = {
        name,
        details,
        tone,
        user_id: user.id,
        generated_description: `Generated description for ${name}`
      };

      return from(
        this.supabase
          .from('product_descriptions')
          .insert([descriptionData])
          .select()
          .single()
      );
    }),
    map(({ data, error }) => {
      if (error) throw error;
      return data as ProductDescription;
    })
  );
}


  // Product Description methods
  /*
  getProductDescriptions(): Observable<ProductDescription[]> {
    return from(
      this.supabase
        .from('product_descriptions')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductDescription[];
      })
    );
  }
*/
  /*
  addProductDescription(name: string, details: string, tone: string): Observable<ProductDescription> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('User not authenticated'));
    }

    const dummyDescription = `Introducing the ${name} - a revolutionary product that ${details.toLowerCase()}. This innovative solution offers unparalleled performance and reliability, making it the perfect choice for discerning customers who demand excellence.`;

    return from(
      this.supabase
        .from('product_descriptions')
        .insert([{
          name,
          details,
          generated_description: dummyDescription,
          tone
        }])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductDescription;
      })
    );
  }*/

  // Social Content methods
  saveSocialContent(content: SocialPromoContent): Observable<SocialPromoContent> {
    return from(
      this.supabase
        .from('social_content')
        .insert([content])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as SocialPromoContent;
      })
    );
  }

  getSocialContent(contentId: string): Observable<SocialPromoContent[]> {
    return from(
      this.supabase
        .from('social_content')
        .select('*')
        .eq('id', contentId)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as SocialPromoContent[];
      })
    );
  }

  deleteSocialContent(contentId: string): Observable<void> {
    return from(
      this.supabase
        .from('social_content')
        .delete()
        .eq('id', contentId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  // Generated Image methods
  saveGeneratedImage(image: GeneratedImage): Observable<GeneratedImage> {
    return from(
      this.supabase
        .from('generated_images')
        .insert([image])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as GeneratedImage;
      })
    );
  }

  getGeneratedImages(imageId: string): Observable<GeneratedImage[]> {
    return from(
      this.supabase
        .from('generated_images')
        .select('*')
        .eq('id', imageId)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as GeneratedImage[];
      })
    );
  }

  deleteGeneratedImage(imageId: string): Observable<void> {
    return from(
      this.supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }
}